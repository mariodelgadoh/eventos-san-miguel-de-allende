const express = require('express');
const { auth, isAdmin } = require('../middleware/auth');
const upload = require('../config/multer');
const carouselController = require('../controllers/carouselController');

const router = express.Router();

// Rutas públicas
router.get('/', carouselController.getCarouselImages);

// Rutas protegidas (solo admin)
router.get('/admin', auth, isAdmin, carouselController.getAllCarouselImages);
router.post('/', auth, isAdmin, upload.single('image'), carouselController.addCarouselImage);
router.put('/:id', auth, isAdmin, upload.single('image'), carouselController.updateCarouselImage);
router.delete('/:id', auth, isAdmin, carouselController.deleteCarouselImage);
router.post('/reorder', auth, isAdmin, carouselController.reorderCarouselImages);
router.post('/initialize', auth, isAdmin, carouselController.initializeDefaultImages);

module.exports = router;