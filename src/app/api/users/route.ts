// src/app/api/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Esquema de validación para la creación de usuarios
const userSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  email: z.string().email("Correo electrónico no válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  role: z.enum(['ADMIN', 'USER']),
});

// GET: Obtener todos los usuarios
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      // Excluimos el campo de la contraseña por seguridad
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

// POST: Crear un nuevo usuario
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedData = userSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsedData.error.flatten() }, { status: 400 });
    }

    const { name, email, password, role } = parsedData.data;

    // Verificar si el usuario o el email ya existen
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { name }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'El nombre de usuario o el correo ya están en uso.' }, { status: 409 });
    }

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // No devolver la contraseña en la respuesta
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    return NextResponse.json({ error: 'Error al crear el usuario' }, { status: 500 });
  }
}