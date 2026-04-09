const nodemailer = require('nodemailer');

// Configuración para Gmail con opciones de timeout
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Opciones para evitar timeout
  pool: true,
  maxConnections: 1,
  rateDelta: 1000,
  rateLimit: 5,
  socketTimeout: 30000, // 30 segundos
  connectionTimeout: 30000 // 30 segundos
});

// Generar código de 6 dígitos
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Enviar correo con código de verificación
const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: `"Eventos SMA" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Recuperación de contraseña - Eventos SMA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px;">
        <div style="background-color: #2563eb; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎉 Eventos SMA</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Recuperación de contraseña</h2>
          <p style="color: #666;">Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p style="color: #666;">Tu código de verificación es:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; background-color: #f0f0f0; padding: 15px; border-radius: 8px; display: inline-block;">
              ${code}
            </div>
          </div>
          <p style="color: #666;">Este código expirará en <strong>10 minutos</strong>.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">Si no solicitaste este cambio, ignora este correo.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; text-align: center;">Eventos San Miguel de Allende</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado:', info.messageId);
    return code;
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    throw new Error('No se pudo enviar el correo');
  }
};

module.exports = { transporter, generateCode, sendVerificationEmail };