const Comment = require('../models/Comment');

exports.getComments = async (req, res) => {
  try {
    const { eventId } = req.params;
    const comments = await Comment.find({ event: eventId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener comentarios', error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { content, rating } = req.body;

    const comment = await Comment.create({
      event: eventId,
      user: req.user._id,
      content,
      rating
    });

    const populatedComment = await comment.populate('user', 'name');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar comentario', error: error.message });
  }
};