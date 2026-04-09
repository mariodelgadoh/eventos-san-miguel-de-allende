const mongoose = require('mongoose');

const carouselImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    default: ''
  },
  imageFile: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Si no existe la colección, la crea
module.exports = mongoose.model('CarouselImage', carouselImageSchema);