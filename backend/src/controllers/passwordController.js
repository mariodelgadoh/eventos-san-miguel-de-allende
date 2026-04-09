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
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #2563eb; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Eventos SMA</h1>
            <p style="color: #dbeafe; margin: 10px 0 0;">San Miguel de Allende</p>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin: 0 0 20px;">Recuperación de contraseña</h2>
            <p style="color: #666; line-height: 1.6;">Hemos recibido una solicitud para restablecer tu contraseña.</p>
            <p style="color: #666; line-height: 1.6;">Tu código de verificación es:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background-color: #f0f0f0; padding: 15px 25px; border-radius: 8px;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${code}</span>
              </div>
            </div>
            <p style="color: #666; line-height: 1.6;">Este código expirará en <strong>10 minutos</strong>.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              Si no solicitaste este cambio, ignora este correo.
            </p>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
              Eventos San Miguel de Allende
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado a:', to, 'ID:', info.messageId);
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
    
    console.log('📧 Solicitud de recuperación para:', email);
    
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
    
    console.log('=========================================');
    console.log(`📧 CÓDIGO DE VERIFICACIÓN PARA ${email}: ${code}`);
    console.log('=========================================');
    
    // Intentar enviar el correo
    const emailSent = await sendVerificationEmail(email, code);
    
    if (emailSent) {
      res.json({ message: 'Código de verificación enviado a tu correo' });
    } else {
      res.json({ 
        message: 'Código generado (revisa los logs de Render)',
        code: code
      });
    }
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ Contraseña actualizada para:', email);
    
    // Eliminar el código usado
    await PasswordReset.deleteOne({ _id: resetRequest._id });
    
    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ message: 'Error al restablecer la contraseña', error: error.message });
  }
};