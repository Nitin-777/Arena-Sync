const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth.middleware')
const { query } = require('../config/queries')

router.use(protect, adminOnly)

router.get('/stats', async (req, res) => {
  try {
    const [bookings, turfs, users, revenue] = await Promise.all([
      query(`
        SELECT
          COUNT(*)                                            AS total,
          COUNT(*) FILTER (WHERE status = 'confirmed')       AS confirmed,
          COUNT(*) FILTER (WHERE status = 'cancelled')       AS cancelled,
          COUNT(*) FILTER (WHERE status = 'pending')         AS pending
        FROM bookings
      `),
      query(`
        SELECT
          COUNT(*)                                          AS total,
          COUNT(*) FILTER (WHERE status = 'active')        AS active
        FROM turfs
      `),
      query(`SELECT COUNT(*) AS total FROM users`),
      query(`
        SELECT COALESCE(SUM(total_amount), 0) AS total
        FROM bookings
        WHERE status = 'confirmed'
      `),
    ])

    const revenueByDay = await query(`
      SELECT
        DATE(created_at)       AS date,
        SUM(total_amount)      AS revenue,
        COUNT(*)               AS bookings
      FROM bookings
      WHERE status = 'confirmed'
        AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `)

    const topTurfs = await query(`
      SELECT
        t.name,
        COUNT(b.id)                                          AS bookings,
        COALESCE(SUM(b.total_amount), 0)                     AS revenue
      FROM turfs t
      LEFT JOIN turf_sports ts ON ts.turf_id = t.id
      LEFT JOIN bookings b
        ON b.turf_sport_id = ts.id AND b.status = 'confirmed'
      GROUP BY t.id, t.name
      ORDER BY revenue DESC
      LIMIT 5
    `)

    const revenueToday = await query(`
      SELECT
        COALESCE(SUM(total_amount) FILTER (
          WHERE created_at >= CURRENT_DATE
        ), 0) AS today,
        COALESCE(SUM(total_amount) FILTER (
          WHERE created_at >= NOW() - INTERVAL '7 days'
        ), 0) AS week,
        COALESCE(SUM(total_amount) FILTER (
          WHERE created_at >= NOW() - INTERVAL '30 days'
        ), 0) AS month
      FROM bookings
      WHERE status = 'confirmed'
    `)

    res.json({
      bookings:     bookings.rows[0],
      turfs:        turfs.rows[0],
      users:        users.rows[0],
      revenue:      revenue.rows[0].total,
      revenueByDay: revenueByDay.rows,
      topTurfs:     topTurfs.rows,
      revenueToday: revenueToday.rows[0],
    })
  } catch (err) {
    console.error('admin stats error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/bookings', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query
    const conditions = status && status !== 'all'
      ? `WHERE b.status = '${status}'`
      : ''

    const result = await query(`
      SELECT
        b.*,
        u.name  AS user_name,
        u.phone AS user_phone,
        t.name  AS turf_name,
        t.address AS turf_address,
        ts.sport,
        p.status             AS payment_status,
        p.gateway_payment_id
      FROM bookings b
      JOIN users u        ON u.id  = b.user_id
      JOIN turf_sports ts ON ts.id = b.turf_sport_id
      JOIN turfs t        ON t.id  = ts.turf_id
      LEFT JOIN payments p ON p.booking_id = b.id
      ${conditions}
      ORDER BY b.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset])

    res.json({ bookings: result.rows })
  } catch (err) {
    console.error('admin bookings error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/turfs', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        t.*,
        u.name  AS owner_name,
        u.phone AS owner_phone,
        COUNT(DISTINCT ts.id)                                         AS sport_count,
        COUNT(DISTINCT b.id)                                          AS total_bookings,
        COALESCE(SUM(b.total_amount) FILTER (
          WHERE b.status = 'confirmed'
        ), 0)                                                         AS total_revenue
      FROM turfs t
      LEFT JOIN users u       ON u.id      = t.owner_id
      LEFT JOIN turf_sports ts ON ts.turf_id = t.id
      LEFT JOIN bookings b    ON b.turf_sport_id = ts.id
      GROUP BY t.id, u.name, u.phone
      ORDER BY t.created_at DESC
    `)
    res.json({ turfs: result.rows })
  } catch (err) {
    console.error('admin turfs error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/turfs/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }
    await query('UPDATE turfs SET status = $1 WHERE id = $2', [status, id])
    res.json({ message: 'Turf status updated' })
  } catch (err) {
    console.error('admin update turf status error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.get('/users', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        u.*,
        COUNT(b.id)                                              AS total_bookings,
        COALESCE(SUM(b.total_amount) FILTER (
          WHERE b.status = 'confirmed'
        ), 0)                                                    AS total_spent
      FROM users u
      LEFT JOIN bookings b ON b.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `)
    res.json({ users: result.rows })
  } catch (err) {
    console.error('admin users error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.put('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body
    if (!['user', 'owner', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, id])
    res.json({ message: 'User role updated' })
  } catch (err) {
    console.error('admin update user role error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router