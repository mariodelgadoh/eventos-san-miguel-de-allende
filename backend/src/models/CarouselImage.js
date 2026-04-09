const mongoose = require('mongoose');

const carouselImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    default: ''
  },
  filename: {
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

module.exports = mongoose.model('CarouselImage', carouselImageSchema);