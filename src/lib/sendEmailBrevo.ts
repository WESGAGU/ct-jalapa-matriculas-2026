import * as Brevo from "@getbrevo/brevo";
import type { Register } from "./types";
import { getCareers } from "./actions";

// 1. Crea la instancia de la API
const apiInstance = new Brevo.TransactionalEmailsApi();

// 2. Asigna la API Key
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

/**
 * Función auxiliar para calcular la cantidad de papeles sellados.
 */
function getPapelesSellados(carrera: string, turno: string): number {
  const c = carrera.toLowerCase();
  const t = turno.toLowerCase();

  // Turno Diurno
  if (t.includes("diurno")) {
    return 1;
  }

  // Turno Sabatino
  if (t.includes("sabatino")) {
    if (
      c.includes("zootecnia") ||
      c.includes("agronomía") ||
      c.includes("agronomia")
    ) {
      return 3;
    }
    if (c.includes("riego")) {
      return 2;
    }
  }

  // Turno Dominical
  if (t.includes("dominical")) {
    if (
      c.includes("computación") ||
      c.includes("computacion") ||
      c.includes("contabilidad")
    ) {
      return 2;
    }
    if (
      c.includes("zootecnia") ||
      c.includes("agronomía") ||
      c.includes("agronomia")
    ) {
      return 3;
    }
  }

  // Valor por defecto
  return 1;
}

/**
 * Envía un correo electrónico de confirmación de matrícula.
 */
export async function sendConfirmationEmail(enrollment: Register) {
  if (!enrollment.email) {
    console.warn("Intento de enviar correo sin una dirección de email.");
    return;
  }

  // 1. Obtener el turno de la carrera desde la base de datos
  let turno = "";
  try {
    const careers = await getCareers();
    const currentCareer = careers.find(
      (c) => c.name === enrollment.carreraTecnica
    );
    if (currentCareer) {
      turno = currentCareer.shift || "";
    }
  } catch (error) {
    console.error(
      "Error al obtener detalles de la carrera para el email:",
      error
    );
  }

  // 2. Determinar la Fecha de Inicio según el Turno
  let fechaInicio = "fecha por confirmar";
  const tLower = turno.toLowerCase();

  if (tLower.includes("diurno")) {
    fechaInicio = "2 de febrero";
  } else if (tLower.includes("sabatino")) {
    fechaInicio = "7 de febrero";
  } else if (tLower.includes("dominical")) {
    fechaInicio = "8 de febrero";
  }

  // 3. Calcular cantidad de papeles sellados
  const cantidadPapeles = getPapelesSellados(enrollment.carreraTecnica, turno);

  // 4. Construir el bloque HTML de requisitos
  const documentsHtml = `
    <div style="background-color: #f0fdf4; padding: 20px; border-left: 4px solid #16a34a; margin: 20px 0; border-radius: 4px;">
        <ul style="color: #374151; padding-left: 20px; font-size: 14px; line-height: 1.6; margin: 0;">
            <li>2 copias de <strong>Diploma de Bachiller</strong>.</li>
            <li>2 copias de <strong>Cédula de Identidad</strong>.</li>
            <li>1 folder tamaño <strong>Legal</strong>.</li>
            <li><strong>${cantidadPapeles} Papel(es) Sellado(s)</strong>.</li>
        </ul>
    </div>
  `;

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject =
    "Confirmación de Matrícula - Centro Tecnológico de Jalapa";
  sendSmtpEmail.to = [
    {
      email: enrollment.email,
      name: `${enrollment.nombres} ${enrollment.apellidos}`,
    },
  ];

  // 5. Contenido HTML completo actualizado
  sendSmtpEmail.htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
<style>
  body{margin:0;padding:0;font-family:'Roboto',Arial,sans-serif;background-color:#f4f7f6}
  .wrapper{width:100%;table-layout:fixed;padding:40px 0}
  .container{max-width:600px;margin:0 auto;background-color:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,.05)}
  .header{background-color:#004a99;padding:24px;text-align:center}
  .header .logo{max-width:160px;height:auto;margin-bottom:12px}
  .content{padding:32px}
  .content h1{font-size:26px;color:#333;margin:0 0 20px;font-weight:700}
  .status-badge{display:inline-block;background-color:#eaf7ec;color:#28a745;padding:10px 18px;border-radius:20px;font-weight:bold;margin-bottom:24px}
  .status-badge img{vertical-align:middle;margin-right:8px}
  .content p{line-height:1.6;color:#555;margin:0 0 16px}
  .content a{color:#337eb3;text-decoration:none}
  .content strong{color:#333}
  .footer{padding:32px;text-align:left;font-size:14px;background-color:#f9f9f9}
  .divider{border:0;border-top:1px solid #eee;margin:24px 0}
  .contact-help{text-align:center}
  .contact-help h2{font-size:16px;color:#333;margin:0 0 12px}
  .social-links{text-align:center;padding-top:20px}
  .social-links a{margin:0 8px}
  .social-links img{width:32px;height:32px}
  .highlight-date { color: #d32f2f; font-weight: bold; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="container">
    <div class="header">
      <img src="https://ct-jalapa-matriculas-2026.vercel.app/logo-inatec-2016.png" alt="Logo INATEC" class="logo">
    </div>
    <div class="content">
      <h1>¡Hola, ${enrollment.nombres} ${enrollment.apellidos}!</h1>
      
      <div class="status-badge">
        <img src="https://ct-jalapa-matriculas-2026.vercel.app/check.png" width="20" height="20" alt="Check"> Matrícula Registrada
      </div>
      
      <p>Hemos recibido tu solicitud de matrícula para la carrera de <strong>${enrollment.carreraTecnica} (${turno})</strong> en el Centro Tecnológico de Jalapa.</p>
      
      <p>Tu información ha sido registrada exitosamente. Por favor preséntate el <strong class="highlight-date">${fechaInicio}</strong> con los siguientes documentos:</p>

      ${documentsHtml}

      <p>¡Gracias por elegirnos para tu formación técnica!</p>
    </div>
    
    <div class="footer">
      <div class="signature">
        <p>Atentamente,</p>
        <p><strong>Equipo de Admisiones</strong></p>
        <p>Centro Tecnológico de Jalapa</p>
      </div>
      <hr class="divider">
      <div class="contact-help">
        <h2>¿Tienes consultas? Contáctanos</h2>
        <p class="phone-numbers">
          <a href="tel:50584433992">84433992</a> | 
          <a href="tel:50587043761">87043761</a> | 
          <a href="tel:50586151205">86151205</a>
        </p>
      </div>
      <div class="social-links">
        <a href="https://www.facebook.com/CTJalapa" target="_blank"><img src="https://ct-jalapa-matriculas-2026.vercel.app/facebook.png" alt="Facebook"></a>
        <a href="https://www.instagram.com/centrotecjalapa/" target="_blank"><img src="https://ct-jalapa-matriculas-2026.vercel.app/instagram.png" alt="Instagram"></a>
        <a href="http://wa.me/50584433992" target="_blank"><img src="https://ct-jalapa-matriculas-2026.vercel.app/whatsapp.png" alt="WhatsApp"></a>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

  sendSmtpEmail.sender = {
    name: "Centro Tecnológico Jalapa",
    email: "wgutierrezg@inatec.edu.ni",
  };

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Correo de confirmación enviado exitosamente. ID:", data.body);
  } catch (error) {
    console.error("Error al enviar el correo de confirmación:", error);
  }
}
