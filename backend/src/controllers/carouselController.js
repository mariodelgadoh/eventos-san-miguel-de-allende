const CarouselImage = require('../models/CarouselImage');

// Obtener todas las imágenes activas (público)
exports.getCarouselImages = async (req, res) => {
  try {
    const images = await CarouselImage.find({ isActive: true }).sort({ order: 1 });
    res.json(images);
  } catch (error) {
    console.error('Error getCarouselImages:', error);
    res.status(500).json({ message: 'Error al obtener imágenes', error: error.message });
  }
};

// Obtener todas las imágenes (admin)
exports.getAllCarouselImages = async (req, res) => {
  try {
    const images = await CarouselImage.find().sort({ order: 1 });
    res.json(images);
  } catch (error) {
    console.error('Error getAllCarouselImages:', error);
    res.status(500).json({ message: 'Error al obtener imágenes', error: error.message });
  }
};

// Agregar nueva imagen
exports.addCarouselImage = async (req, res) => {
  try {
    const { imageUrl, title, order } = req.body;
    
    console.log('Recibiendo imagen:', { imageUrl, title, order });
    
    if (!imageUrl) {
      return res.status(400).json({ message: 'La URL de la imagen es obligatoria' });
    }
    
    const newImage = new CarouselImage({
      imageUrl: imageUrl,
      title: title || '',
      order: order || 0,
      isActive: true
    });
    
    await newImage.save();
    console.log('Imagen guardada:', newImage._id);
    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error addCarouselImage:', error);
    res.status(500).json({ message: 'Error al agregar imagen', error: error.message });
  }
};

// Actualizar imagen
exports.updateCarouselImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, title, order, isActive } = req.body;
    
    const updateData = {
      title: title || '',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: Date.now()
    };
    
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }
    
    const updatedImage = await CarouselImage.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedImage) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }
    
    res.json(updatedImage);
  } catch (error) {
    console.error('Error updateCarouselImage:', error);
    res.status(500).json({ message: 'Error al actualizar imagen', error: error.message });
  }
};

// Eliminar imagen
exports.deleteCarouselImage = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedImage = await CarouselImage.findByIdAndDelete(id);
    
    if (!deletedImage) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }
    
    res.json({ message: 'Imagen eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleteCarouselImage:', error);
    res.status(500).json({ message: 'Error al eliminar imagen', error: error.message });
  }
};

// Inicializar imágenes por defecto
exports.initializeDefaultImages = async (req, res) => {
  try {
    await CarouselImage.deleteMany({});
    
    const defaultImages = [
      { imageUrl: '/images/hero/imagen1.jpg', title: 'San Miguel de Allende - Parroquia', order: 0, isActive: true },
      { imageUrl: '/images/hero/imagen2.jpg', title: 'San Miguel de Allende - Callejón', order: 1, isActive: true },
      { imageUrl: '/images/hero/imagen3.jpg', title: 'San Miguel de Allende - Vista', order: 2, isActive: true },
      { imageUrl: '/images/hero/imagen4.jpg', title: 'San Miguel de Allende - Jardín', order: 3, isActive: true },
      { imageUrl: '/images/hero/imagen5.jpg', title: 'San Miguel de Allende - Atardecer', order: 4, isActive: true }
    ];
    
    await CarouselImage.insertMany(defaultImages);
    res.json({ message: 'Imágenes por defecto inicializadas', count: 5 });
  } catch (error) {
    console.error('Error initializeDefaultImages:', error);
    res.status(500).json({ message: 'Error al inicializar imágenes', error: error.message });
  }
};