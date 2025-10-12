// src/lib/sendNotifyBrevo.ts
import * as Brevo from "@getbrevo/brevo";
import type { Register } from "./types";

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!
);

/**
 * Envía un correo de notificación al administrador sobre una nueva matrícula.
 * @param enrollment - Los datos de la nueva matrícula.
 */
export async function sendNewEnrollmentNotificationEmail(enrollment: Register) {

  const adminEmail = 'garcia2016weslin@gmail.com'; //correo emisor de notificaciones
  
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = `Nueva Matrícula Recibida: ${enrollment.nombres} ${enrollment.apellidos}`;
  sendSmtpEmail.to = [{ email: adminEmail }];
  
  sendSmtpEmail.htmlContent = `
    <h1>Nueva Matrícula desde el Formulario Público</h1>
    <p>Se ha registrado una nueva matrícula con los siguientes datos:</p>
    <ul>
      <li><strong>Estudiante:</strong> ${enrollment.nombres} ${enrollment.apellidos}</li>
      <li><strong>Cédula:</strong> ${enrollment.cedula || 'No proporcionada'}</li>
      <li><strong>Teléfono:</strong> ${enrollment.telefonoCelular}</li>
      <li><strong>Email:</strong> ${enrollment.email || 'No proporcionado'}</li>
      <li><strong>Carrera:</strong> ${enrollment.carreraTecnica}</li>
      <li><strong>Turno:</strong> ${enrollment.career?.shift || 'No especificado'}</li>
      <li><strong>Fecha de Registro:</strong> ${new Date(enrollment.createdAt).toLocaleString('es-NI')}</li>
    </ul>
    <p>Puedes ver los detalles completos en el panel de administración.</p>
  `;

  sendSmtpEmail.sender = {
    name: "Sistema de Matrículas CETA",
    email: "wgutierrezg@inatec.edu.ni", // correo del remitente
  };

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Correo de notificación al admin enviado exitosamente. ID:", data.body);
  } catch (error) {
    console.error("Error al enviar el correo de notificación al admin:", error);
  }
}