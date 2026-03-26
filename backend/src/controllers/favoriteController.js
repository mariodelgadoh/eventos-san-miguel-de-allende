const Favorite = require('../models/Favorite');

exports.addFavorite = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const favorite = await Favorite.create({
      user: req.user._id,
      event: eventId
    });

    res.status(201).json(favorite);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El evento ya está en favoritos' });
    }
    res.status(500).json({ message: 'Error al agregar favorito', error: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    await Favorite.findOneAndDelete({
      user: req.user._id,
      event: eventId
    });

    res.json({ message: 'Favorito eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar favorito', error: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('event')
      .sort({ createdAt: -1 });
    
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener favoritos', error: error.message });
  }
};