const { query } = require('../config/queries');
const { generateSlotsForDays } = require('../jobs/slotGenerator.job');

const getAvailableSlots = async (req, res) => {
  try {
    const { turf_sport_id, date } = req.query;

    if (!turf_sport_id || !date) {
      return res.status(400).json({ message: 'turf_sport_id and date are required' });
    }

    await generateSlotsForDays(1);

    const now = new Date();

    const todayIST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const todayStr = todayIST.toISOString().split('T')[0];

    const isToday = date === todayStr;

    const currentHour   = String(todayIST.getHours()).padStart(2, '0');
    const currentMinute = String(todayIST.getMinutes()).padStart(2, '0');
    const currentTime   = `${currentHour}:${currentMinute}`;

    let result;

    if (isToday) {
      result = await query(`
        SELECT s.*,
          ts.base_price,
          ts.sport,
          ts.slot_duration_min
        FROM slots s
        JOIN turf_sports ts ON ts.id = s.turf_sport_id
        WHERE s.turf_sport_id = $1
          AND s.date = $2
          AND s.status = 'available'
          AND s.start_time > $3
        ORDER BY s.start_time ASC
      `, [turf_sport_id, date, currentTime]);
    } else {
      result = await query(`
        SELECT s.*,
          ts.base_price,
          ts.sport,
          ts.slot_duration_min
        FROM slots s
        JOIN turf_sports ts ON ts.id = s.turf_sport_id
        WHERE s.turf_sport_id = $1
          AND s.date = $2
          AND s.status = 'available'
        ORDER BY s.start_time ASC
      `, [turf_sport_id, date]);
    }

    res.json({ slots: result.rows });
  } catch (error) {
    console.error('getAvailableSlots error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const triggerSlotGeneration = async (req, res) => {
  try {
    await generateSlotsForDays(7);
    res.json({ message: 'Slots generated successfully for next 7 days' });
  } catch (error) {
    console.error('triggerSlotGeneration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAvailableSlots, triggerSlotGeneration };