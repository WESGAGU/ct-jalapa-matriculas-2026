// src/app/api/user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import type { User } from '@/lib/types';

// Clave secreta para firmar el token (debe estar en tus variables de entorno)
const key = new TextEncoder().encode(process.env.AUTH_SECRET);

// Esquema de validación para los datos de entrada
const updateUserSchema = z.object({
  name: z.string()
    .min(1, "El nombre es requerido.")
    .refine(name => !/\s/.test(name), {
      message: "El nombre de usuario no puede contener espacios.",
    })
    .optional(),
  email: z.string().email("El correo no es válido.").optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres.").optional(),
}).refine(data => {
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    return true;
  }, {
    message: "La contraseña actual es requerida para establecer una nueva.",
    path: ["currentPassword"],
  });


async function getSession() {
  const cookiesStore = await cookies();
  const sessionCookie = cookiesStore.get('session')?.value;

  if (!sessionCookie) return null;

  try {
    const { payload } = await jwtVerify(sessionCookie, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function GET() {
    const session = await getSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: (session.user as User).id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });

    if (!user) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
    const session = await getSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const parsedData = updateUserSchema.safeParse(body);

        if (!parsedData.success) {
            return NextResponse.json({ error: 'Datos inválidos', details: parsedData.error.flatten() }, { status: 400 });
        }

        const { name, email, currentPassword, newPassword } = parsedData.data;
        const userId = (session.user as User).id;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const updateData: { name?: string; email?: string; password?: string } = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;

        if (newPassword && currentPassword) {
            const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordsMatch) {
                return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 401 });
            }
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        return NextResponse.json({ message: 'Perfil actualizado con éxito', user: { name: updatedUser.name, email: updatedUser.email } });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}