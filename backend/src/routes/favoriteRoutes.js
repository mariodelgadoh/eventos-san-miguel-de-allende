const express = require('express');
const { auth } = require('../middleware/auth');
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favoriteController');

const router = express.Router();

router.get('/', auth, getFavorites);
router.post('/:eventId', auth, addFavorite);
router.delete('/:eventId', auth, removeFavorite);

module.exports = router;