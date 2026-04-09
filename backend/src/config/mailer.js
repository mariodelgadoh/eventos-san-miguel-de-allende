const nodemailer = require('nodemailer');

// Configuración de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: `"Eventos SMA" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Recuperación de contraseña - Eventos SMA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2563eb; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Eventos SMA</h1>
        </div>
        <div style="background-color: white; padding: 30px; border: 1px solid #ddd;">
          <h2 style="color: #333;">Recuperación de contraseña</h2>
          <p style="color: #666;">Tu código de verificación es:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 5px; color: #2563eb;">${code}</span>
            </div>
          </div>
          <p style="color: #666;">Este código expirará en <strong>10 minutos</strong>.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado a:', email);
    return code;
  } catch (error) {
    console.error('❌ Error:', error);
    throw new Error('No se pudo enviar el correo');
  }
};

module.exports = { generateCode, sendVerificationEmail };