// src/app/api/careers/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateCareerSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres.").optional(),
  shift: z.enum(['DIURNO', 'SABATINO', 'DOMINICAL']).optional(),
  active: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsedData = updateCareerSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsedData.error.flatten() }, { status: 400 });
    }

    const updatedCareer = await prisma.career.update({
      where: { id: params.id },
      data: parsedData.data,
    });

    return NextResponse.json(updatedCareer);
  } catch (error) {
    console.error(`Error al actualizar la carrera ${params.id}:`, error);
    return NextResponse.json({ error: 'Error al actualizar la carrera.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.career.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Error al eliminar la carrera ${params.id}:`, error);
    return NextResponse.json({ error: 'Error al eliminar la carrera.' }, { status: 500 });
  }
}