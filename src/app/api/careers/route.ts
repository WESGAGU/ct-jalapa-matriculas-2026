// src/app/api/careers/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const careerSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  shift: z.enum(['DIURNO', 'SABATINO', 'DOMINICAL']),
});

export async function GET() {
  try {
    const careers = await prisma.career.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(careers);
  } catch (error) {
    // CORRECCIÓN: Añadido console.error para usar la variable 'error'.
    console.error("Error al obtener las carreras:", error); 
    return NextResponse.json({ error: 'Error al obtener las carreras.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedData = careerSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: parsedData.error.flatten() }, { status: 400 });
    }

    const { name, shift } = parsedData.data;

    const newCareer = await prisma.career.create({
      data: {
        name,
        shift,
        active: true, // Por defecto, las nuevas carreras están activas
      },
    });

    return NextResponse.json(newCareer, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe una carrera con ese nombre.' }, { status: 409 });
    }
    console.error("Error al crear la carrera:", error);
    return NextResponse.json({ error: 'Error al crear la carrera.' }, { status: 500 });
  }
}