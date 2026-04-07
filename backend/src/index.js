const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

require('./config/db')

const authRoutes    = require('./routes/auth.routes')
const turfRoutes    = require('./routes/turf.routes')
const slotsRoutes   = require('./routes/slots.routes')
const bookingRoutes = require('./routes/booking.routes')
const paymentRoutes = require('./routes/payment.routes')
const adminRoutes   = require('./routes/admin.routes')

const { startSlotGenerationJob } = require('./jobs/slotGenerator.job')
const { startLockCleanupJob }    = require('./jobs/lockCleanup.job')

const app = express()

app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Arena Sync API is running' })
})

app.use('/api/auth',     authRoutes)
app.use('/api/turfs',    turfRoutes)
app.use('/api/slots',    slotsRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin',    adminRoutes)

startSlotGenerationJob()
startLockCleanupJob()

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Arena Sync server running on port ${PORT}`)
})