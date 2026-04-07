const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth.middleware')
const { query } = require('../config/queries')

router.use(protect, adminOnly)

router.get('/stats', async (req, res) => {
  try {
    const [bookings, turfs, users, revenue] = await Promise.all([
      query(`SELECT COUNT(*) as total,
        COUNT(*) FILTER (WHERE status='confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status='cancelled') as cancelled,
        COUNT(*) FILTER (WHERE status='pending') as pending
        FROM bookings`),
      query(`SELECT COUNT(*) as total,
        COUNT(*) FILTER (WHERE status='active') as active
        FROM turfs`),
      query(`SELECT COUNT(*) as total FROM users`),
      query(`SELECT COALESCE(SUM(total_amount),0) as total
        FROM bookings WHERE status='confirmed'`),
    ])

    const revenueByDay = await query(`
      SELECT DATE(created_at) as date,
        SUM(total_amount) as revenue,
        COUNT(*) as bookings
      FROM bookings
      WHERE status = 'confirmed'
        AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `)

    const topTurfs = await query(`
      SELECT t.name, COUNT(b.id) as bookings,
        COALESCE(SUM(b.total_amount),0) as revenue
      FROM turfs t
      LEFT JOIN turf_sports ts ON ts.turf_id = t.id
      LEFT JOIN bookings b ON b.turf_sport_id = ts.id AND b.status = 'confirmed'
      GROUP BY t.id, t.name
      ORDER BY revenue DESC
      LIMIT 5
    `)

    res.json({
      bookings: bookings.rows[0],
      turfs: turfs.rows[0],
      users: users.rows[0],
      revenue: revenue.rows[0].total,
      revenueByDay: revenueByDay.rows,
      topTurfs: topTurfs.rows,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/bookings', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query
    const conditions = status ? `WHERE b.status = '${status}'` : ''
    const result = await query(`
      SELECT b.*,
        u.name as user_name, u.phone as user_phone,
        t.name as turf_name, t.address as turf_address,
        ts.sport,
        p.status as payment_status,
        p.gateway_payment_id
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN turf_sports ts ON ts.id = b.turf_sport_id
      JOIN turfs t ON t.id = ts.turf_id
      LEFT JOIN payments p ON p.booking_id = b.id
      ${conditions}
      ORDER BY b.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset])
    res.json({ bookings: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/turfs', async (req, res) => {
  try {
    const result = await query(`
      SELECT t.*,
        u.name as owner_name, u.phone as owner_phone,
        COUNT(DISTINCT ts.id) as sport_count,
        COUNT(DISTINCT b.id) as total_bookings,
        COALESCE(SUM(b.total_amount) FILTER (WHERE b.status='confirmed'), 0) as total_revenue
      FROM turfs t
      LEFT JOIN users u ON u.id = t.owner_id
      LEFT JOIN turf_sports ts ON ts.turf_id = t.id
      LEFT JOIN bookings b ON b.turf_sport_id = ts.id
      GROUP BY t.id, u.name, u.phone
      ORDER BY t.created_at DESC
    `)
    res.json({ turfs: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/turfs/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    await query('UPDATE turfs SET status=$1 WHERE id=$2', [status, id])
    res.json({ message: 'Turf status updated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/users', async (req, res) => {
  try {
    const result = await query(`
      SELECT u.*,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(b.total_amount) FILTER (WHERE b.status='confirmed'), 0) as total_spent
      FROM users u
      LEFT JOIN bookings b ON b.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `)
    res.json({ users: result.rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body
    await query('UPDATE users SET role=$1 WHERE id=$2', [role, id])
    res.json({ message: 'User role updated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router