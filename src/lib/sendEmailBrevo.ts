import * as Brevo from '@getbrevo/brevo';
import type { Register } from './types';

// 1. Crea la instancia de la API directamente
const apiInstance = new Brevo.TransactionalEmailsApi();

// 2. Asigna la API Key usando el método setApiKey()
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

/**
 * Envía un correo electrónico de confirmación de matrícula.
 * @param enrollment - Los datos de la matrícula del estudiante.
 */
export async function sendConfirmationEmail(enrollment: Register) {
  if (!enrollment.email) {
    console.warn('Intento de enviar correo sin una dirección de email.');
    return;
  }

  // URL absoluta de tu logo. Asegúrate que 'logo-inatec-2016.png' está en tu carpeta /public
  const logoUrl = 'https://ct-jalapa-matriculas-2026.vercel.app/logo-inatec-2016.png';

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = 'Confirmación de Matrícula - Centro Tecnológico de Jalapa';
  sendSmtpEmail.to = [{ email: enrollment.email, name: `${enrollment.nombres} ${enrollment.apellidos}` }];
  sendSmtpEmail.htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif; }
        .wrapper { width: 100%; background-color: #f4f4f4; padding: 20px 0; }
        .container { max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .header { text-align: center; padding: 20px 0; }
        .logo { max-width: 180px; height: auto; }
        .content { padding: 0 30px 30px 30px; }
        h1 { color: #003366; font-size: 24px; margin-top: 0; }
        p { line-height: 1.6; color: #333; }
        strong { color: #0056b3; }
        hr { border: 0; border-top: 1px solid #eee; margin: 20px 0; }
        .footer { font-size: 0.9em; color: #777; }
        .subtitle { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; }
        .subtitle span { font-size: 18px; color: #28a745; font-weight: bold; }
        .contact-info, .social-links { text-align: center; padding-top: 20px; }
        .contact-info { border-top: 1px solid #eee; }
        .contact-info p { margin: 5px 0; color: #555; }
        .social-links { padding-top: 15px; }
        .social-links a { margin: 0 10px; }
        .social-links img { width: 32px; height: 32px; }

        @media (max-width: 600px) {
          h1 { font-size: 20px; }
          .content { padding: 0 20px 20px 20px; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="Logo INATEC" class="logo">
          </div>
          <div class="content">
            <h1>¡Hola, ${enrollment.nombres}!</h1>
            
            <div class="subtitle">
              <img src="https://ct-jalapa-matriculas-2026-80iz0dgf3.vercel.app/check.png" width="24" height="24" alt="Checkmark">
              <span>Matrícula Registrada</span>
            </div>

            <p>Hemos recibido tu solicitud de matrícula para la carrera de <strong>${enrollment.carreraTecnica}</strong> en el Centro Tecnológico de Jalapa.</p>
            <p>Tu información ha sido registrada exitosamente. Un miembro de nuestro equipo se pondrá en contacto contigo a finales de enero para confirmar tu matrícula y orientarte sobre el inicio de clases.</p>
            <p>¡Gracias por elegirnos para tu formación técnica!</p>
            
            <div class="contact-info">
              <p>Para cualquier consulta, no dudes en contactarnos:</p>
              <p>
                <strong>Llamadas:</strong> 
                <a href="tel:50584433992">8443-3992</a> | 
                <a href="tel:50587043761">8704-3761</a> | 
                <a href="tel:50586151205">8615-1205</a>
              </p>
            </div>

            <div class="social-links">
              <a href="https://www.facebook.com/CTJalapa" target="_blank"><img src="https://ct-jalapa-matriculas-2026-80iz0dgf3.vercel.app/facebook.png" alt="Facebook"></a>
              <a href="https://www.instagram.com/centrotecjalapa/" target="_blank"><img src="https://ct-jalapa-matriculas-2026-80iz0dgf3.vercel.app/instagram.png" alt="Instagram"></a>
              <a href="http://wa.me/50584433992" target="_blank"><img src="https://ct-jalapa-matriculas-2026-80iz0dgf3.vercel.app/whatsapp.png" alt="WhatsApp"></a>
            </div>

            <hr>
            <div class="footer">
              <p>Atentamente,<br><strong>Equipo de Admisiones</strong><br>Centro Tecnológico de Jalapa</p>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  sendSmtpEmail.sender = { 
    name: 'Centro Tecnológico Jalapa', 
    email: 'wgutierrezg@inatec.edu.ni' 
  };

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Correo de confirmación enviado exitosamente. ID:', data.body);
  } catch (error) {
    console.error('Error al enviar el correo de confirmación:', error);
  }
}