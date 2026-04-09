const express = require('express');
const { auth, isAdmin } = require('../middleware/auth');
const upload = require('../config/multer');
const {
  getCarouselImages,
  getAllCarouselImages,
  addCarouselImage,
  updateCarouselImage,
  deleteCarouselImage,
  initializeDefaultImages
} = require('../controllers/carouselController');

const router = express.Router();

// Rutas públicas
router.get('/', getCarouselImages);

// Rutas protegidas (solo admin)
router.get('/admin', auth, isAdmin, getAllCarouselImages);
router.post('/', auth, isAdmin, upload.single('image'), addCarouselImage);
router.put('/:id', auth, isAdmin, upload.single('image'), updateCarouselImage);
router.delete('/:id', auth, isAdmin, deleteCarouselImage);
router.post('/initialize', auth, isAdmin, initializeDefaultImages);

module.exports = router;