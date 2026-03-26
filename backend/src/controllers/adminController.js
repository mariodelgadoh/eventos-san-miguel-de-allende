const User = require('../models/User');
const Event = require('../models/Event');
const Comment = require('../models/Comment');
const Favorite = require('../models/Favorite');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const eventsCount = await Event.countDocuments({ organizer: user._id });
        const commentsCount = await Comment.countDocuments({ user: user._id });
        const favoritesCount = await Favorite.countDocuments({ user: user._id });
        
        return {
          ...user.toObject(),
          eventsCount,
          commentsCount,
          favoritesCount
        };
      })
    );
    
    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ isActive: true });
    const featuredEvents = await Event.countDocuments({ isFeatured: true });
    const totalComments = await Comment.countDocuments();
    const totalFavorites = await Favorite.countDocuments();
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const admins = await User.countDocuments({ role: 'admin' });
    const organizers = await User.countDocuments({ role: 'organizer' });
    
    const eventsByCategory = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const topUsers = await Event.aggregate([
      { $group: { _id: '$organizer', eventCount: { $sum: 1 } } },
      { $sort: { eventCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' }
    ]);
    
    res.json({
      totalUsers,
      totalEvents,
      activeEvents,
      featuredEvents,
      totalComments,
      totalFavorites,
      blockedUsers,
      admins,
      organizers,
      eventsByCategory,
      topUsers: topUsers.map(t => ({
        name: t.user.name,
        email: t.user.email,
        eventCount: t.eventCount
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'No se puede bloquear a un administrador' });
    }
    
    user.isBlocked = true;
    user.blockedReason = reason || 'Violación de las políticas de la plataforma';
    user.blockedAt = new Date();
    await user.save();
    
    res.json({ 
      message: 'Usuario bloqueado exitosamente',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked,
        blockedReason: user.blockedReason
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al bloquear usuario', error: error.message });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    user.isBlocked = false;
    user.blockedReason = '';
    user.blockedAt = null;
    await user.save();
    
    res.json({ 
      message: 'Usuario desbloqueado exitosamente',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al desbloquear usuario', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 1) {
        return res.status(403).json({ message: 'No se puede eliminar al último administrador' });
      }
    }
    
    await Event.deleteMany({ organizer: id });
    await Comment.deleteMany({ user: id });
    await Favorite.deleteMany({ user: id });
    await user.deleteOne();
    
    res.json({ message: 'Usuario y todo su contenido eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};

exports.changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 1) {
        return res.status(403).json({ message: 'No se puede cambiar el rol del último administrador' });
      }
    }
    
    user.role = role;
    await user.save();
    
    res.json({ 
      message: 'Rol actualizado exitosamente',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar rol', error: error.message });
  }
};