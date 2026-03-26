const express = require('express');
const { auth } = require('../middleware/auth');
const { addComment, getComments } = require('../controllers/commentController');

const router = express.Router();

router.get('/:eventId', getComments);
router.post('/:eventId', auth, addComment);

module.exports = router;