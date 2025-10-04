import { SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Clave secreta para firmar el token (debe estar en tus variables de entorno)
const key = new TextEncoder().encode(process.env.AUTH_SECRET);

// Esquema de validación para los datos de entrada
const loginSchema = z.object({
  login: z.string().min(1, "El usuario o correo es requerido."),
  password: z.string().min(1, "La contraseña es requerida."),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedCredentials = loginSchema.safeParse(body);

    if (!parsedCredentials.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const { login, password } = parsedCredentials.data;

    // 1. Buscar al usuario en la base de datos por nombre o email
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: login }, { name: login }],
      },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // 2. Comparar la contraseña proporcionada con la almacenada (hasheada)
    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // 3. Crear el token (sesión) si las credenciales son correctas
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expira en 24 horas
    const session = await new SignJWT({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .setIssuedAt()
      .sign(key);

    // ================== LA CORRECCIÓN ESTÁ AQUÍ ==================
    
    // 1. Creamos una respuesta JSON vacía para enviar al cliente.
    const response = NextResponse.json({ message: 'Inicio de sesión exitoso' });

    // 2. Usamos el método .cookies.set() sobre el objeto de respuesta.
    response.cookies.set('session', session, { 
      expires, 
      httpOnly: true, 
      path: '/' 
    });

    // 3. Devolvemos la respuesta con la cookie ya establecida.
    return response;
    
    // =============================================================

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}