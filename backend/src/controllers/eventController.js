const Event = require('../models/Event');

exports.createEvent = async (req, res) => {
  try {
    const { name, description, address, coordinates, images, date, category } = req.body;
    
    const event = await Event.create({
      name,
      description,
      address,
      coordinates,
      images: images || [],
      date,
      category,
      organizer: req.user._id
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear evento', error: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { search, category, startDate, endDate, featured, type } = req.query;
    const filter = {};
    
    const now = new Date();
    
    // Filtrar por tipo de evento
    if (type === 'upcoming') {
      // Eventos futuros (fecha >= ahora)
      filter.date = { $gte: now };
      filter.isActive = true;
    } else if (type === 'past') {
      // Eventos pasados (fecha < ahora)
      filter.date = { $lt: now };
    } else {
      // Si no se especifica tipo, mostrar todos activos
      filter.isActive = true;
    }

    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (startDate || endDate) {
      filter.date = filter.date || {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const events = await Event.find(filter)
      .populate('organizer', 'name email')
      .sort({ date: type === 'past' ? -1 : 1 });

    res.json(events);
  } catch (error) {
    console.error('Error getEvents:', error);
    res.status(500).json({ message: 'Error al obtener eventos', error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener evento', error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    if (req.body.coordinates) {
      const { lat, lng } = req.body.coordinates;
      const isValidLat = lat >= 20.85 && lat <= 21.05;
      const isValidLng = lng >= -100.85 && lng <= -100.60;
      
      if (!isValidLat || !isValidLng) {
        return res.status(400).json({ 
          message: 'Las coordenadas deben estar dentro de San Miguel de Allende' 
        });
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'name email');

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar evento', error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    if (req.user.role !== 'admin' && event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }

    await event.deleteOne();
    res.json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar evento', error: error.message });
  }
};

exports.toggleFeatured = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    event.isFeatured = !event.isFeatured;
    await event.save();

    res.json({ message: `Evento ${event.isFeatured ? 'destacado' : 'no destacado'}`, event });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar estado destacado', error: error.message });
  }
};

// Función para archivar eventos pasados (opcional)
exports.archivePastEvents = async () => {
  try {
    const now = new Date();
    const result = await Event.updateMany(
      { date: { $lt: now }, isActive: true },
      { isActive: false }
    );
    console.log(`📦 ${result.modifiedCount} eventos archivados automáticamente`);
    return result;
  } catch (error) {
    console.error('Error archivando eventos:', error);
  }
};