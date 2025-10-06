// src/app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const userUpdateSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres.").optional(),
  email: z.string().email("Correo electrónico no válido.").optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
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
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsedData = userUpdateSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsedData.error.flatten() }, { status: 400 });
    }

    const { name, email, password, role } = parsedData.data;
    
    // Verifica si el nuevo nombre de usuario o email ya existen en otro usuario
    if (name || email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email },
            { name: name },
          ],
          NOT: {
            id: params.id,
          },
        },
      });

      if (existingUser) {
        return NextResponse.json({ error: 'El nombre de usuario o el correo ya están en uso por otro usuario.' }, { status: 409 });
      }
    }


    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    });

    // No devolver la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    return NextResponse.json({ error: 'Error al actualizar el usuario' }, { status: 500 });
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.user.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    return NextResponse.json({ error: 'Error al eliminar el usuario' }, { status: 500 });
  }
}