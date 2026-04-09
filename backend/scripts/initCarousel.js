const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const CarouselImage = require('../src/models/CarouselImage');

const initCarousel = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Eliminar imágenes existentes
    await CarouselImage.deleteMany({});
    console.log('Imágenes anteriores eliminadas');

    const defaultImages = [
      { imageUrl: '/images/hero/imagen1.jpg', title: 'San Miguel de Allende - Parroquia', order: 0, isActive: true },
      { imageUrl: '/images/hero/imagen2.jpg', title: 'San Miguel de Allende - Callejón', order: 1, isActive: true },
      { imageUrl: '/images/hero/imagen3.jpg', title: 'San Miguel de Allende - Vista', order: 2, isActive: true },
      { imageUrl: '/images/hero/imagen4.jpg', title: 'San Miguel de Allende - Jardín', order: 3, isActive: true },
      { imageUrl: '/images/hero/imagen5.jpg', title: 'San Miguel de Allende - Atardecer', order: 4, isActive: true }
    ];

    await CarouselImage.insertMany(defaultImages);
    console.log('5 imágenes por defecto insertadas');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

initCarousel();