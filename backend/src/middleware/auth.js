const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error();
    }

    if (user.isBlocked) {
      return res.status(403).json({ 
        message: 'Tu cuenta ha sido bloqueada',
        reason: user.blockedReason,
        blockedAt: user.blockedAt
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Por favor, autentícate' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador' });
  }
  next();
};

module.exports = { auth, isAdmin };