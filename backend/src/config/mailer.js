const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email, code) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
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
    });

    if (error) {
      console.error('Error de Resend:', error);
      throw new Error('No se pudo enviar el correo');
    }

    console.log('✅ Correo enviado a:', email, 'ID:', data?.id);
    return code;
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    throw new Error('No se pudo enviar el correo');
  }
};

module.exports = { generateCode, sendVerificationEmail };