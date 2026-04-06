const express = require('express');
const router = express.Router();
const { getAvailableSlots, triggerSlotGeneration } = require('../controllers/slots.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

router.get('/availability', getAvailableSlots);
router.post('/generate', protect, adminOnly, triggerSlotGeneration);

module.exports = router;