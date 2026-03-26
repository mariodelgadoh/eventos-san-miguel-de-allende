const express = require('express');
const { auth, isAdmin } = require('../middleware/auth');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  toggleFeatured
} = require('../controllers/eventController');

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', auth, createEvent);
router.put('/:id', auth, updateEvent);
router.delete('/:id', auth, deleteEvent);
router.patch('/:id/featured', auth, isAdmin, toggleFeatured);

module.exports = router;