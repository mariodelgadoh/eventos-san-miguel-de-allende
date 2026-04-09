const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Configurar transporter de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000
});

// Generar código de 6 dígitos
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Enviar correo electrónico
const sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: `"Eventos SMA" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Recuperación de contraseña - Eventos SMA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Eventos SMA</h1>
        </div>
        <div style="background-color: white; padding: 30px; border: 1px solid #ddd;">
          <h2>Recuperación de contraseña</h2>
          <p>Tu código de verificación es:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #2563eb;">${code}</span>
            </div>
          </div>
          <p>Este código expirará en <strong>10 minutos</strong>.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado a:', to);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar correo:', error.message);
    return false;
  }
};

// Solicitar código de recuperación
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('📧 Solicitud para:', email);
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No existe una cuenta con este correo' });
    }
    
    await PasswordReset.deleteMany({ email });
    
    const code = generateCode();
    
    await PasswordReset.create({ email, code });
    
    console.log('=========================================');
    console.log(`📧 CÓDIGO PARA ${email}: ${code}`);
    console.log('=========================================');
    
    const emailSent = await sendVerificationEmail(email, code);
    
    res.json({ 
      message: emailSent ? 'Código enviado a tu correo' : 'Código generado (revisa logs)',
      code: code
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error', error: error.message });
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
    
    console.log('🔐 Restableciendo contraseña para:', email);
    
    const resetRequest = await PasswordReset.findOne({ email, code });
    if (!resetRequest) {
      return res.status(400).json({ message: 'Código inválido o expirado' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Generar hash directamente
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Actualizar usando findByIdAndUpdate para evitar el middleware
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });
    
    console.log('✅ Contraseña actualizada para:', email);
    
    await PasswordReset.deleteOne({ _id: resetRequest._id });
    
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error al restablecer la contraseña', error: error.message });
  }
};