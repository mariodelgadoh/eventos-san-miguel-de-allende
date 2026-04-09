const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === 'admin' ? 'organizer' : (role || 'organizer')
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Intento de login para:', email);
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son obligatorios' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }
    
    if (user.isBlocked) {
      return res.status(403).json({ 
        message: 'Tu cuenta ha sido bloqueada',
        reason: user.blockedReason
      });
    }
    
    console.log('🔑 Hash guardado en BD:', user.password ? user.password.substring(0, 30) + '...' : 'No hay hash');
    
    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 ¿Contraseña coincide?', isMatch ? 'SÍ ✅' : 'NO ❌');
    
    if (!isMatch) {
      console.log('❌ Contraseña incorrecta para:', email);
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }
    
    console.log('✅ Login exitoso para:', email);
    
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};