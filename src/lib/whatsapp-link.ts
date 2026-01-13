import { Register } from "./types";

/**
 * Calcula la cantidad de papeles sellados (Misma lógica del correo)
 */
function getPapelesSellados(carrera: string, turno: string): number {
  const c = carrera.toLowerCase();
  const t = turno.toLowerCase();

  if (t.includes("diurno")) return 1;

  if (t.includes("sabatino")) {
    if (c.includes("zootecnia") || c.includes("agronomía") || c.includes("agronomia")) return 3;
    if (c.includes("riego")) return 2;
  }

  if (t.includes("dominical")) {
    if (c.includes("computación") || c.includes("computacion") || c.includes("contabilidad")) return 2;
    if (c.includes("zootecnia") || c.includes("agronomía") || c.includes("agronomia")) return 3;
  }
  return 1;
}

/**
 * Genera el enlace de WhatsApp con el mensaje formateado
 */
export function generateWhatsAppLink(enrollment: Register, careerShift: string) {
  if (!enrollment.telefonoCelular) return null;

  // 1. Limpiar teléfono y asegurar código de país (505)
  let phone = enrollment.telefonoCelular.replace(/\D/g, "");
  if (phone.length === 8) phone = `505${phone}`;

  // 2. Determinar Fecha de Inicio
  let fechaInicio = "fecha por confirmar";
  const tLower = careerShift.toLowerCase();
  if (tLower.includes("diurno")) fechaInicio = "2 de febrero";
  else if (tLower.includes("sabatino")) fechaInicio = "7 de febrero";
  else if (tLower.includes("dominical")) fechaInicio = "8 de febrero";

  // 3. Obtener documentos
  const papeles = getPapelesSellados(enrollment.carreraTecnica, careerShift);

  // 4. Construir el mensaje con el texto solicitado
  const message = 
`Hola *${enrollment.nombres} ${enrollment.apellidos}*, hemos recibido tu matrícula para *${enrollment.carreraTecnica} (${careerShift})* en el Centro Tecnológico de Jalapa. ✅

Tu información ha sido registrada exitosamente. Preséntate el *${fechaInicio}* que es inicio de clase con los siguientes documentos:

🎓 2 copias de Diploma de Bachiller
🪪 2 copias de Cédula de Identidad
🖿 1 folder tamaño Legal
🗎 *${papeles} Papel(es) Sellado(s)*

¡Gracias por elegirnos para tu formación técnica, Te esperamos!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}