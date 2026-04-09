const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { sendVerificationEmail, generateCode } = require('../config/mailer');
const bcrypt = require('bcryptjs');

// Solicitar código de recuperación
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
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
    
    // Enviar correo
    await sendVerificationEmail(email, code);
    
    res.json({ message: 'Código de verificación enviado a tu correo' });
  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    res.status(500).json({ message: 'Error al enviar el código', error: error.message });
  }
};

// Verificar código
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const resetRequest = await PasswordReset.findOne({ email, code });
    if (!resetRequest) {
      return res.status(400).json({ message: 'Código inválido o expirado' });
    }
    
    res.json({ message: 'Código verificado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al verificar el código', error: error.message });
  }
};

// Restablecer contraseña
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
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
    res.status(500).json({ message: 'Error al restablecer la contraseña', error: error.message });
  }
};