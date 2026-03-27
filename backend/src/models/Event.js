const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  images: [{
    type: String,
    default: []
  }],
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['Cultura', 'Música', 'Gastronomía', 'Arte', 'Deporte'],
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índices para búsqueda
eventSchema.index({ name: 'text', description: 'text' });

// Validación de ubicación dentro de San Miguel de Allende
eventSchema.pre('save', function(next) {
  const { lat, lng } = this.coordinates;
  const isValidLat = lat >= 20.85 && lat <= 21.05;
  const isValidLng = lng >= -100.85 && lng <= -100.60;
  
  if (!isValidLat || !isValidLng) {
    next(new Error('Las coordenadas deben estar dentro de San Miguel de Allende'));
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);