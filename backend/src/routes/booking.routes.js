const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, cancelBooking } = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createBooking);
router.get('/my', protect, getUserBookings);
router.post('/:id/cancel', protect, cancelBooking);

module.exports = router;