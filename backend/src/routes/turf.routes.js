const express = require('express');
const router = express.Router();
const {
  getAllTurfs,
  getTurfById,
  createTurf,
  updateTurf,
} = require('../controllers/turf.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', getAllTurfs);
router.get('/:id', getTurfById);
router.post('/', protect, createTurf);
router.put('/:id', protect, updateTurf);

module.exports = router;