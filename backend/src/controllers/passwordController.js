const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const bcrypt = require('bcryptjs');

// Generar código de 6 dígitos
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Solicitar código de recuperación (versión temporal SIN correo)
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'El correo es obligatorio' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No existe una cuenta con este correo' });
    }
    
    // Eliminar códigos anteriores del mismo email
    await PasswordReset.deleteMany({ email });
    
    // Generar nuevo código
    const code = generateCode();
    
    // Guardar en la base de datos
    await PasswordReset.create({ email, code });
    
    // Mostrar el código en la consola de Render
    console.log('=========================================');
    console.log(`📧 CÓDIGO DE VERIFICACIÓN PARA ${email}: ${code}`);
    console.log('=========================================');
    
    // Devolver el código en la respuesta para pruebas
    res.json({ 
      message: 'Código generado correctamente (modo desarrollo)',
      code: code,
      email: email
    });
  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    res.status(500).json({ message: 'Error al generar el código', error: error.message });
  }
};

// Verificar código
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ message: 'Email y código son obligatorios' });
    }
    
    const resetRequest = await PasswordReset.findOne({ email, code });
    if (!resetRequest) {
      return res.status(400).json({ message: 'Código inválido o expirado' });
    }
    
    res.json({ message: 'Código verificado correctamente' });
  } catch (error) {
    console.error('Error en verifyCode:', error);
    res.status(500).json({ message: 'Error al verificar el código', error: error.message });
  }
};

// Restablecer contraseña
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    const resetRequest = await PasswordReset.findOne({ email, code });
    if (!resetRequest) {
      return res.status(400).json({ message: 'Código inválido o expirado' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    // Eliminar el código usado
    await PasswordReset.deleteOne({ _id: resetRequest._id });
    
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ message: 'Error al restablecer la contraseña', error: error.message });
  }
};