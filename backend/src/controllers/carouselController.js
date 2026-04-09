const CarouselImage = require('../models/CarouselImage');
const fs = require('fs');
const path = require('path');

// Obtener todas las imágenes activas (público)
exports.getCarouselImages = async (req, res) => {
  try {
    const images = await CarouselImage.find({ isActive: true }).sort({ order: 1 });
    const imagesWithUrl = images.map(img => {
      const imgObj = img.toObject();
      if (imgObj.filename && !imgObj.imageUrl) {
        imgObj.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${imgObj.filename}`;
      }
      return imgObj;
    });
    res.json(imagesWithUrl);
  } catch (error) {
    console.error('Error getCarouselImages:', error);
    res.status(500).json({ message: 'Error al obtener imágenes', error: error.message });
  }
};

// Obtener todas las imágenes (admin)
exports.getAllCarouselImages = async (req, res) => {
  try {
    const images = await CarouselImage.find().sort({ order: 1 });
    const imagesWithUrl = images.map(img => {
      const imgObj = img.toObject();
      if (imgObj.filename && !imgObj.imageUrl) {
        imgObj.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${imgObj.filename}`;
      }
      return imgObj;
    });
    res.json(imagesWithUrl);
  } catch (error) {
    console.error('Error getAllCarouselImages:', error);
    res.status(500).json({ message: 'Error al obtener imágenes', error: error.message });
  }
};

// Agregar nueva imagen (con archivo o URL)
exports.addCarouselImage = async (req, res) => {
  try {
    const { title, order, imageUrl } = req.body;
    let filename = '';
    
    if (req.file) {
      filename = req.file.filename;
      console.log('Archivo guardado:', filename);
    }
    
    if (!filename && !imageUrl) {
      return res.status(400).json({ message: 'Debes subir una imagen o proporcionar una URL' });
    }
    
    const newImage = new CarouselImage({
      imageUrl: imageUrl || '',
      filename: filename || '',
      title: title || '',
      order: order || 0,
      isActive: true
    });
    
    await newImage.save();
    
    const responseImg = newImage.toObject();
    if (responseImg.filename) {
      responseImg.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${responseImg.filename}`;
    }
    
    res.status(201).json(responseImg);
  } catch (error) {
    console.error('Error addCarouselImage:', error);
    res.status(500).json({ message: 'Error al agregar imagen', error: error.message });
  }
};

// Actualizar imagen
exports.updateCarouselImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, order, isActive, imageUrl } = req.body;
    let filename = '';
    
    if (req.file) {
      filename = req.file.filename;
    }
    
    const updateData = {
      title: title || '',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      updatedAt: Date.now()
    };
    
    if (filename) {
      // Si hay un nuevo archivo, eliminar el anterior
      const oldImage = await CarouselImage.findById(id);
      if (oldImage && oldImage.filename) {
        const oldFilePath = path.join(__dirname, '../../uploads', oldImage.filename);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      updateData.filename = filename;
      updateData.imageUrl = '';
    } else if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
      updateData.filename = '';
    }
    
    const updatedImage = await CarouselImage.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedImage) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }
    
    const responseImg = updatedImage.toObject();
    if (responseImg.filename) {
      responseImg.imageUrl = `${req.protocol}://${req.get('host')}/uploads/${responseImg.filename}`;
    }
    
    res.json(responseImg);
  } catch (error) {
    console.error('Error updateCarouselImage:', error);
    res.status(500).json({ message: 'Error al actualizar imagen', error: error.message });
  }
};

// Eliminar imagen
exports.deleteCarouselImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await CarouselImage.findById(id);
    
    if (!image) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }
    
    // Eliminar archivo físico si existe
    if (image.filename) {
      const filePath = path.join(__dirname, '../../uploads', image.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Archivo eliminado:', filePath);
      }
    }
    
    await CarouselImage.findByIdAndDelete(id);
    res.json({ message: 'Imagen eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleteCarouselImage:', error);
    res.status(500).json({ message: 'Error al eliminar imagen', error: error.message });
  }
};

// Inicializar imágenes por defecto
exports.initializeDefaultImages = async (req, res) => {
  try {
    // Eliminar todas las imágenes existentes y sus archivos
    const existingImages = await CarouselImage.find();
    for (const img of existingImages) {
      if (img.filename) {
        const filePath = path.join(__dirname, '../../uploads', img.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
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