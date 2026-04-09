const { query } = require('../config/queries');

const calculatePrice = async (turf_sport_id, slotIds) => {
  const turfSport = await query(
    'SELECT * FROM turf_sports WHERE id = $1',
    [turf_sport_id]
  );
  const { base_price } = turfSport.rows[0];

  const rules = await query(
    'SELECT * FROM pricing_rules WHERE turf_sport_id = $1 ORDER BY priority DESC',
    [turf_sport_id]
  );

  const firstSlot = await query(
    'SELECT * FROM slots WHERE id = $1',
    [slotIds[0]]
  );

  const slot = firstSlot.rows[0];
  const slotDate = new Date(slot.date);
  const dayOfWeek = slotDate.getDay();
  const startHour = parseInt(slot.start_time.split(':')[0]);

  let multiplier = 1;

  for (const rule of rules.rows) {
    const condition = rule.condition;
    if (rule.rule_type === 'peak_hour') {
      const peakStart = parseInt(condition.start.split(':')[0]);
      const peakEnd = parseInt(condition.end.split(':')[0]);
      if (startHour >= peakStart && startHour < peakEnd) {
        multiplier = Math.max(multiplier, parseFloat(rule.multiplier));
      }
    }
    if (rule.rule_type === 'day_of_week') {
      if (condition.days.includes(dayOfWeek)) {
        multiplier = Math.max(multiplier, parseFloat(rule.multiplier));
      }
    }
  }

  const totalAmount = parseFloat(base_price) * multiplier * slotIds.length;
  return parseFloat(totalAmount.toFixed(2));
};

const createBooking = async (req, res) => {
  const client = await require('../config/db').connect();
  try {
    const { turf_sport_id, slot_ids, date } = req.body;

    if (!turf_sport_id || !slot_ids || slot_ids.length === 0 || !date) {
      return res.status(400).json({ message: 'turf_sport_id, slot_ids and date are required' });
    }

    await client.query('BEGIN');

    const slotsResult = await client.query(
      `SELECT * FROM slots
       WHERE id = ANY($1::uuid[])
       AND turf_sport_id = $2
       AND date = $3
       ORDER BY start_time ASC
       FOR UPDATE`,
      [slot_ids, turf_sport_id, date]
    );

    if (slotsResult.rows.length !== slot_ids.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'One or more slots not found' });
    }

    const unavailable = slotsResult.rows.filter(s => s.status !== 'available');
    if (unavailable.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'One or more slots are not available' });
    }

    const slots = slotsResult.rows;
    for (let i = 1; i < slots.length; i++) {
      if (slots[i].start_time !== slots[i - 1].end_time) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Slots must be contiguous' });
      }
    }

    const lockExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await client.query(
      `UPDATE slots
       SET status = 'locked', locked_by = $1, lock_expires_at = $2
       WHERE id = ANY($3::uuid[])`,
      [req.user.id, lockExpiry, slot_ids]
    );

    const totalAmount = await calculatePrice(turf_sport_id, slot_ids);

    const bookingResult = await client.query(
      `INSERT INTO bookings
        (user_id, turf_sport_id, slot_ids, date, start_time, end_time, total_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING *`,
      [
        req.user.id,
        turf_sport_id,
        slot_ids,
        date,
        slots[0].start_time,
        slots[slots.length - 1].end_time,
        totalAmount,
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Slots locked. Complete payment within 10 minutes.',
      booking: bookingResult.rows[0],
      total_amount: totalAmount,
      lock_expires_at: lockExpiry,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('createBooking error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

const getUserBookings = async (req, res) => {
  try {
    const result = await query(`
      SELECT b.*,
        t.name as turf_name,
        t.address as turf_address,
        ts.sport,
        p.status as payment_status,
        p.gateway_payment_id
      FROM bookings b
      JOIN turf_sports ts ON ts.id = b.turf_sport_id
      JOIN turfs t ON t.id = ts.turf_id
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [req.user.id]);

    res.json({ bookings: result.rows });
  } catch (error) {
    console.error('getUserBookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const cancelBooking = async (req, res) => {
  const client = await require('../config/db').connect();
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await client.query('BEGIN');

    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    const bookingDate = new Date(booking.date);
    const timeParts = booking.start_time.split(':');
    bookingDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);
    const hoursUntilSlot = (bookingDate.getTime() - Date.now()) / (1000 * 60 * 60);

    const turfSportResult = await client.query(
      'SELECT turf_id FROM turf_sports WHERE id = $1',
      [booking.turf_sport_id]
    );

    if (turfSportResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Turf sport not found' });
    }

    const turf_id = turfSportResult.rows[0].turf_id;

    const policies = await client.query(
      `SELECT * FROM cancellation_policies
       WHERE turf_id = $1
       ORDER BY hours_before DESC`,
      [turf_id]
    );

    let refundPercent = 0;
    for (const policy of policies.rows) {
      if (hoursUntilSlot >= policy.hours_before) {
        refundPercent = policy.refund_percent;
        break;
      }
    }

    const paymentResult = await client.query(
      'SELECT * FROM payments WHERE booking_id = $1',
      [id]
    );

    let refundAmount = 0;
    if (
      paymentResult.rows.length > 0 &&
      paymentResult.rows[0].status === 'captured'
    ) {
      refundAmount = (parseFloat(booking.total_amount) * refundPercent) / 100;
    }

    await client.query(
      `UPDATE bookings
       SET status = 'cancelled',
           cancellation_reason = $1,
           cancelled_at = NOW()
       WHERE id = $2`,
      [reason || 'Cancelled by user', id]
    );

    await client.query(
      `UPDATE slots
       SET status = 'available',
           locked_by = NULL,
           lock_expires_at = NULL
       WHERE id = ANY($1::uuid[])`,
      [booking.slot_ids]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Booking cancelled successfully',
      refund_percent: refundPercent,
      refund_amount: refundAmount,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('cancelBooking error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

module.exports = { createBooking, getUserBookings, cancelBooking };