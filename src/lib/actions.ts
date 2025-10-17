// src/lib/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import type { Register } from './types';
import prisma from './prisma';
import cloudinary from './cloudinary';
import { Prisma } from '@prisma/client';

// Importamos cada función desde su archivo específico
import { sendConfirmationEmail } from '@/lib/sendEmailBrevo';
import { sendNewEnrollmentNotificationEmail } from '@/lib/sendNotifyBrevo';


console.log('use server');

// --- Helper Functions for Cloudinary ---

function getPublicIdFromUrl(url: string | undefined | null): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1 || uploadIndex + 2 >= parts.length) {
      return null;
    }
    const publicIdWithFormat = parts.slice(uploadIndex + 2).join('/');
    const publicId = publicIdWithFormat.substring(0, publicIdWithFormat.lastIndexOf('.'));
    return publicId;
  } catch (error) {
    console.error("Could not extract public_id from URL:", url, error);
    return null;
  }
}

async function uploadImage(dataUri: string | undefined | null): Promise<{ url: string | null; publicId: string | null }> {
  if (!dataUri || !dataUri.startsWith('data:image')) {
    // MODIFICADO: Devolver null para url y publicId si no hay data URI
    return { url: null, publicId: null };
  }
  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'enrollments',
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error('Failed to upload image to Cloudinary.');
  }
}

export async function addEnrollment(enrollment: Register, userId?: string) {
  await new Promise(resolve => setTimeout(resolve, 1000));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, user: _user, userId: _userId, career: _career, ...rest } = enrollment;

  if (typeof rest.cedula === 'string' && rest.cedula.trim() === '') {
    rest.cedula = null;
  }
  if (typeof rest.email === 'string' && rest.email.trim() === '') {
    rest.email = null;
  }

  // 1. Pre-check for duplicates before any uploads
  const checks: Prisma.RegisterWhereInput[] = [];
  if (rest.cedula && typeof rest.cedula === 'string' && rest.cedula.trim() !== '') {
    checks.push({ cedula: rest.cedula });
  }
  if (rest.email && typeof rest.email === 'string' && rest.email.trim() !== '') {
    checks.push({ email: rest.email });
  }

  if (checks.length > 0) {
    const existingEnrollment = await prisma.register.findFirst({
      where: { OR: checks },
    });

    if (existingEnrollment) {
      if (existingEnrollment.cedula && rest.cedula && existingEnrollment.cedula === rest.cedula) {
        throw new Error(`La cédula ${rest.cedula} ya está registrada.`);
      }
      if (existingEnrollment.email && rest.email && existingEnrollment.email === rest.email) {
        throw new Error(`El correo ${rest.email} ya está registrado.`);
      }
    }
  }

  const uploadedImagePublicIds: string[] = [];

  try {
    const uploadAndTrack = async (dataUri: string | undefined | null): Promise<string | null> => { // MODIFICADO: Tipo de retorno explícito
      // MODIFICADO: Si no hay data URI, retorna null directamente.
      if (!dataUri || !dataUri.startsWith('data:image')) {
        return null;
      }
      const { url, publicId } = await uploadImage(dataUri);
      if (publicId) {
        uploadedImagePublicIds.push(publicId);
      }
      return url; // `url` ya es `string | null` gracias a `uploadImage`
    };
    
    const cedulaFrenteUrl = await uploadAndTrack(rest.cedulaFileFrente);
    const cedulaReversoUrl = await uploadAndTrack(rest.cedulaFileReverso);
    const birthCertificateUrl = await uploadAndTrack(rest.birthCertificateFile);
    const diplomaUrl = await uploadAndTrack(rest.diplomaFile);
    const gradesCertificateUrl = await uploadAndTrack(rest.gradesCertificateFile);
    const firmaUrl = await uploadAndTrack(rest.firmaProtagonista);

    const { carreraTecnica, ...dataWithoutCareer } = rest;

    const createData: Prisma.RegisterCreateInput = {
      ...dataWithoutCareer,
      id,
      birthDate: new Date(enrollment.birthDate),
      // MODIFICADO: Asegurarse de que los valores sean `string | null`, no `undefined`
      cedulaFileFrente: cedulaFrenteUrl,
      cedulaFileReverso: cedulaReversoUrl,
      birthCertificateFile: birthCertificateUrl,
      diplomaFile: diplomaUrl,
      gradesCertificateFile: gradesCertificateUrl,
      firmaProtagonista: firmaUrl,
      user: userId ? { connect: { id: userId } } : undefined,
      career: { connect: { name: carreraTecnica } },
    };

    const newEnrollment = await prisma.register.create({
      data: createData,
      include: {
        career: true, // Incluimos la carrera para tener el dato del turno
      },
    });

    // Si el estudiante proporcionó un correo, enviarle la confirmación
    if (newEnrollment.email) {
      try {
        await sendConfirmationEmail(newEnrollment as Register);
      } catch (emailError) {
        console.error("La matrícula se guardó, pero falló el envío del correo de confirmación:", emailError);
      }
    }
    
    // Si la matrícula no tiene un userId, es pública, así que notificamos al admin
    if (!userId) {
        try {
            await sendNewEnrollmentNotificationEmail(newEnrollment as Register);
        } catch (notificationError) {
            console.error("La matrícula se guardó, pero falló el envío de la notificación al administrador:", notificationError);
        }
    }


    revalidatePath('/');
    revalidatePath(`/${newEnrollment.id}`);
    revalidatePath('/register');
    return newEnrollment;

  } catch (error) {
    if (uploadedImagePublicIds.length > 0) {
      console.log(`Error during database operation. Deleting ${uploadedImagePublicIds.length} uploaded images...`);
      await cloudinary.api.delete_resources(uploadedImagePublicIds);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[]) || [];
      if (target.includes('cedula')) {
        throw new Error('Error: La cédula ingresada ya existe.');
      }
      if (target.includes('email')) {
        throw new Error('Error: El correo electrónico ingresado ya existe.');
      }
    }
    // MODIFICADO: Loguear el error completo en el servidor para facilitar la depuración
    console.error("Error completo en addEnrollment:", error);
    throw error;
  }
}

export async function getEnrollments(
  page = 1,
  limit = 5,
  filters: { 
    date?: string; 
    user?: string; 
    career?: string;
    name?: string;
    documentFilter?: string;
  } = {}
) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const skip = (page - 1) * limit;

  const where: Prisma.RegisterWhereInput = {};

  if (filters.date) {
    const [year, month, day] = filters.date.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day);
    const endOfDay = new Date(year, month - 1, day + 1);
    where.createdAt = {
      gte: startOfDay,
      lt: endOfDay,
    };
  }

  if (filters.user) {
    where.user = {
      name: {
        contains: filters.user,
        mode: 'insensitive',
      },
    };
  }

  if (filters.career) {
    where.career = {
      name: {
        contains: filters.career,
        mode: 'insensitive',
      },
    };
  }

  // Nuevo filtro por nombre
  if (filters.name) {
    where.OR = [
      {
        nombres: {
          contains: filters.name,
          mode: 'insensitive',
        },
      },
      {
        apellidos: {
          contains: filters.name,
          mode: 'insensitive',
        },
      },
    ];
  }

  // Nuevo filtro por documentos - CORREGIDO
  if (filters.documentFilter) {
    if (filters.documentFilter === 'without') {
      // Registros sin NINGÚN documento
      where.AND = [
        { cedulaFileFrente: null },
        { cedulaFileReverso: null },
        { birthCertificateFile: null },
        { diplomaFile: null },
        { gradesCertificateFile: null },
      ];
    } else if (filters.documentFilter === 'with') {
      // Registros con AL MENOS UN documento
      where.OR = [
        { cedulaFileFrente: { not: null } },
        { cedulaFileReverso: { not: null } },
        { birthCertificateFile: { not: null } },
        { diplomaFile: { not: null } },
        { gradesCertificateFile: { not: null } },
      ];
    } else if (filters.documentFilter === 'complete') {
      // Registros con TODOS los documentos
      where.AND = [
        { cedulaFileFrente: { not: null } },
        { cedulaFileReverso: { not: null } },
        { birthCertificateFile: { not: null } },
        { diplomaFile: { not: null } },
        { gradesCertificateFile: { not: null } },
      ];
    }
    // "all" no aplica ningún filtro de documentos
  }

  const [enrollments, total] = await Promise.all([
    prisma.register.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        career: true,
      },
    }),
    prisma.register.count({ where }),
  ]);
  return { enrollments, total };
}

export async function getEnrollmentById(id: string) {
  if (!id) return null;
  await new Promise(resolve => setTimeout(resolve, 300));
  const enrollment = await prisma.register.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      career: true,
    },
  });
  return enrollment;
}

type RegisterImageKeys = keyof Pick<Register,
  'cedulaFileFrente' |
  'cedulaFileReverso' |
  'birthCertificateFile' |
  'diplomaFile' |
  'gradesCertificateFile' |
  'firmaProtagonista'
>;

export async function updateEnrollment(id: string, data: Partial<Omit<Register, 'id'>>) {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const existingEnrollment = await prisma.register.findUnique({ where: { id } });
  if (!existingEnrollment) {
    throw new Error("Matrícula no encontrada.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { birthDate, user: _user, userId: _userId, career: _career, ...rest } = data;
  
  const { carreraTecnica, ...otherData } = rest;
  
  const updateData: Prisma.RegisterUpdateInput = { ...otherData };

  if (birthDate) {
    updateData.birthDate = new Date(birthDate);
  }

  if (carreraTecnica) {
    updateData.career = {
      connect: {
        name: carreraTecnica,
      },
    };
  }

  const imageFields: RegisterImageKeys[] = [
    'cedulaFileFrente',
    'cedulaFileReverso',
    'birthCertificateFile',
    'diplomaFile',
    'gradesCertificateFile',
    'firmaProtagonista',
  ];
  
  const newlyUploadedPublicIds: string[] = [];
  const publicIdsToDelete: string[] = [];

  for (const field of imageFields) {
    const newValue = data[field];
    const oldValue = existingEnrollment[field];

    if (typeof newValue === 'string' && newValue.startsWith('data:image')) {
      if (oldValue) {
        const publicId = getPublicIdFromUrl(oldValue);
        if (publicId) publicIdsToDelete.push(publicId);
      }
      
      const { url, publicId } = await uploadImage(newValue);
      
      updateData[field] = url;

      if (publicId) newlyUploadedPublicIds.push(publicId);
    }
  }

  if (typeof updateData.cedula === 'string' && updateData.cedula.trim() === '') {
    updateData.cedula = null;
  }
  if (typeof updateData.email === 'string' && updateData.email.trim() === '') {
    updateData.email = null;
  }

  try {
    const updatedEnrollment = await prisma.register.update({
      where: { id },
      data: updateData,
    });
    
    if (publicIdsToDelete.length > 0) {
      await cloudinary.api.delete_resources(publicIdsToDelete);
    }

    revalidatePath('/');
    revalidatePath(`/${id}`);
    revalidatePath('/register');
    return updatedEnrollment;

  } catch (error) {
      if (newlyUploadedPublicIds.length > 0) {
          await cloudinary.api.delete_resources(newlyUploadedPublicIds);
      }
      // MODIFICADO: Loguear el error completo en el servidor
      console.error("Error completo en updateEnrollment:", error);
      throw error;
  }
}

export async function deleteEnrollment(id: string) {
  const enrollmentToDelete = await prisma.register.findUnique({ where: { id } });

  if (enrollmentToDelete) {
    const imagesToDelete = [
      getPublicIdFromUrl(enrollmentToDelete.cedulaFileFrente),
      getPublicIdFromUrl(enrollmentToDelete.cedulaFileReverso),
      getPublicIdFromUrl(enrollmentToDelete.birthCertificateFile),
      getPublicIdFromUrl(enrollmentToDelete.diplomaFile),
      getPublicIdFromUrl(enrollmentToDelete.gradesCertificateFile),
      getPublicIdFromUrl(enrollmentToDelete.firmaProtagonista),
    ].filter((id): id is string => id !== null);

    if (imagesToDelete.length > 0) {
      await cloudinary.api.delete_resources(imagesToDelete);
    }
  }

  try {
    await prisma.register.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/register');
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar la matrícula:', error);
    return { success: false, error: 'No se pudo eliminar la matrícula.' };
  }
}

// Función para calcular la edad
function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export async function getEnrollmentStats() {
  const [
    totalEnrollments,
    enrollmentsByCareerRaw,
    enrollmentsByLocationRaw,
    enrollmentsByAcademicLevelRaw,
    allEnrollmentsForAge,
    allCareers,
  ] = await Promise.all([
    prisma.register.count(),
    prisma.register.groupBy({
      by: ['carreraTecnica'],
      _count: { carreraTecnica: true },
      orderBy: { _count: { carreraTecnica: 'desc' } },
    }),
    prisma.register.groupBy({
      by: ['municipioDomiciliar', 'comunidad'],
      _count: { id: true },
      orderBy: [
        { municipioDomiciliar: 'asc' },
        { _count: { id: 'desc' } },
      ],
    }),
    prisma.register.groupBy({
      by: ['nivelAcademico'],
      _count: { nivelAcademico: true },
      orderBy: { _count: { nivelAcademico: 'desc' } },
    }),
    prisma.register.findMany({ select: { birthDate: true } }),
    prisma.career.findMany({ select: { name: true, shift: true } }),
  ]);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyTotal = await prisma.register.count({
    where: { createdAt: { gte: startOfMonth } },
  });

  // --- LÓGICA MODIFICADA PARA EL GRÁFICO ---
  const startDate = new Date(2025, 9, 1); // Octubre de 2025 (mes 9)
  const today = new Date();

  // Calcular el número de meses desde la fecha de inicio hasta hoy
  const yearDiff = today.getFullYear() - startDate.getFullYear();
  const monthDiff = today.getMonth() - startDate.getMonth();
  const totalMonthsToShow = yearDiff * 12 + monthDiff + 1;

  const monthlyEnrollments = await Promise.all(
    Array.from({ length: totalMonthsToShow > 0 ? totalMonthsToShow : 0 }).map(async (_, i) => {
      // Calculamos la fecha para cada mes en el rango
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);

      // Formateamos el nombre para que incluya mes y año (ej: "oct. 2025")
      const monthName = date.toLocaleString('es-NI', { month: 'short' });
      const year = date.getFullYear();
      const formattedName = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

      // Definimos el inicio y fin de ese mes específico
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);

      const count = await prisma.register.count({
        where: { createdAt: { gte: start, lte: end } },
      });

      return { name: formattedName, total: count };
    })
  );
  
  const careersMap = new Map(allCareers.map(c => [c.name, c.shift]));

  const enrollmentsByCareer = enrollmentsByCareerRaw.map(item => ({
    name: item.carreraTecnica,
    total: item._count.carreraTecnica,
    shift: careersMap.get(item.carreraTecnica) || 'DESCONOCIDO',
  }));

  const enrollmentsByLocation = enrollmentsByLocationRaw.reduce((acc: { municipio: string; comunidades: { name: string; total: number }[] }[], item) => {
    const municipio = item.municipioDomiciliar;
    const comunidad = {
      name: item.comunidad,
      total: item._count?.id ?? 0,
    };
    
    const existingMunicipio = acc.find((m: { municipio: string }) => m.municipio === municipio);
    if (existingMunicipio) {
      existingMunicipio.comunidades.push(comunidad);
    } else {
      acc.push({
        municipio,
        comunidades: [comunidad],
      });
    }
    return acc;
  }, []);


  const enrollmentsByAcademicLevel = enrollmentsByAcademicLevelRaw.map(item => ({
    name: item.nivelAcademico,
    total: item._count.nivelAcademico,
  }));

  const ages = allEnrollmentsForAge.map(enrollment => calculateAge(enrollment.birthDate));
  const ageCounts = ages.reduce((acc, age) => {
    acc[age] = (acc[age] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const enrollmentsByAge = Object.entries(ageCounts)
    .map(([age, total]) => ({
      age: parseInt(age, 10),
      total,
    }))
    .sort((a, b) => a.age - b.age);


  return {
    totalEnrollments,
    monthlyTotal,
    monthlyEnrollments, // Ya no es necesario invertirlo
    enrollmentsByCareer,
    enrollmentsByLocation,
    enrollmentsByAcademicLevel,
    enrollmentsByAge,
  };
}

export async function getCareers() {
  return await prisma.career.findMany({
    where: { active: true },
    orderBy: { name: 'asc',
    },
  });
}

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// ▼▼▼ FUNCIONES PARA LOS REPORTES  ▼▼▼

export async function getAllEnrollments(): Promise<Register[]> {
  try {
    const enrollments = await prisma.register.findMany({
      orderBy: {
        career: {
          name: 'asc'
        },
      },
      include: {
        user: { select: { name: true } },
        career: true,
      },
    });
    // @typescript-eslint/ban-ts-comment
    return enrollments;
  } catch (error) {
    console.error("Error fetching all enrollments:", error);
    throw new Error("No se pudieron obtener todas las matrículas.");
  }
}

export async function getEnrollmentsByCareer(careerName: string): Promise<Register[]> {
  if (!careerName) {
    return [];
  }
  try {
    const enrollments = await prisma.register.findMany({
      where: {
        carreraTecnica: careerName,
      },
      orderBy: {
        apellidos: 'asc',
      },
      include: {
        user: { select: { name: true } },
        career: true,
      },
    });
    // @typescript-eslint/ban-ts-comment
    return enrollments;
  } catch (error) {
    console.error(`Error fetching enrollments for career ${careerName}:`, error);
    throw new Error("No se pudieron obtener las matrículas para esa carrera.");
  }
}