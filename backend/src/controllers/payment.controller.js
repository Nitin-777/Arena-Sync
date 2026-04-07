const Razorpay = require('razorpay')
const crypto = require('crypto')
const { query } = require('../config/queries')

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const createPaymentOrder = async (req, res) => {
  try {
    const { booking_id } = req.body

    if (!booking_id) {
      return res.status(400).json({ message: 'booking_id is required' })
    }

    const bookingResult = await query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [booking_id, req.user.id]
    )

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    const booking = bookingResult.rows[0]

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is not in pending state' })
    }

    const options = {
      amount: Math.round(booking.total_amount * 100),
      currency: 'INR',
      receipt: `booking_${booking_id.slice(0, 20)}`,
      notes: {
        booking_id,
        user_id: req.user.id,
      },
    }

    const order = await razorpay.orders.create(options)

    const existingPayment = await query(
      'SELECT * FROM payments WHERE booking_id = $1',
      [booking_id]
    )

    if (existingPayment.rows.length > 0) {
      await query(
        `UPDATE payments SET gateway_order_id = $1, status = 'created'
         WHERE booking_id = $2`,
        [order.id, booking_id]
      )
    } else {
      await query(
        `INSERT INTO payments (booking_id, gateway, gateway_order_id, amount, status)
         VALUES ($1, 'razorpay', $2, $3, 'created')`,
        [booking_id, order.id, booking.total_amount]
      )
    }

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      booking_id,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

const verifyPayment = async (req, res) => {
  const client = await require('../config/db').connect()

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_id,
    } = req.body

    const sign = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' })
    }

    await client.query('BEGIN')

    await client.query(
      `UPDATE payments
       SET gateway_payment_id = $1, status = 'captured', paid_at = NOW()
       WHERE booking_id = $2`,
      [razorpay_payment_id, booking_id]
    )

    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE id = $1',
      [booking_id]
    )
    const booking = bookingResult.rows[0]

    await client.query(
      `UPDATE bookings SET status = 'confirmed' WHERE id = $1`,
      [booking_id]
    )

    await client.query(
      `UPDATE slots
       SET status = 'booked', locked_by = NULL, lock_expires_at = NULL
       WHERE id = ANY($1::uuid[])`,
      [booking.slot_ids]
    )

    await client.query('COMMIT')

    res.json({
      message: 'Payment verified. Booking confirmed.',
      booking_id,
      payment_id: razorpay_payment_id,
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  } finally {
    client.release()
  }
}

module.exports = { createPaymentOrder, verifyPayment }