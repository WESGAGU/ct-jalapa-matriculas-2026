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

// --- NUEVA FUNCIÓN PARA MARCAR COMO IMPRESO ---
export async function markAsPrinted(id: string) {
  try {
    await prisma.register.update({
      where: { id },
      data: { isPrinted: true },
    });
    // Revalidamos las rutas donde se muestra la lista para refrescar los datos
    revalidatePath('/register');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error marking as printed:", error);
    return { success: false, error: "Error al actualizar estado de impresión" };
  }
}
// ---------------------------------------------

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
        return { 
          success: false, 
          error: `La cédula ${rest.cedula} ya está registrada.`,
          data: null 
        };
      }
      if (existingEnrollment.email && rest.email && existingEnrollment.email === rest.email) {
        return { 
          success: false, 
          error: `El correo ${rest.email} ya está registrado.`,
          data: null 
        };
      }
    }
  }

  const uploadedImagePublicIds: string[] = [];

  try {
    const uploadAndTrack = async (dataUri: string | undefined | null): Promise<string | null> => {
      if (!dataUri || !dataUri.startsWith('data:image')) {
        return null;
      }
      const { url, publicId } = await uploadImage(dataUri);
      if (publicId) {
        uploadedImagePublicIds.push(publicId);
      }
      return url;
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
        career: true,
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
    revalidatePath(`/register/edit/${newEnrollment.id}`);
    revalidatePath('/register');
    
    return { 
      success: true, 
      error: null, 
      data: newEnrollment 
    };

  } catch (error) {
    if (uploadedImagePublicIds.length > 0) {
      console.log(`Error during database operation. Deleting ${uploadedImagePublicIds.length} uploaded images...`);
      await cloudinary.api.delete_resources(uploadedImagePublicIds).catch(console.error);
    }

    let userMessage = 'No se pudo completar el registro. Verifique su conexión e intente nuevamente. Si el problema persiste, contacte al administrador.';

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes('cedula')) {
          userMessage = 'La cédula ingresada ya está registrada en el sistema.';
        }
        if (target.includes('email')) {
          userMessage = 'El correo electrónico ingresado ya está registrado en el sistema.';
        }
      }
      
      if (error.code === 'P2025') {
        userMessage = 'No se encontró el registro solicitado.';
      }
      if (error.code === 'P2003') {
        userMessage = 'Error de referencia: La carrera seleccionada no existe.';
      }
    }

    if (error instanceof Error && error.message.includes('Cloudinary')) {
      userMessage = 'Error al subir los documentos. Por favor, intente nuevamente.';
    }

    if (error instanceof Error && error.message.includes('validation')) {
      userMessage = 'Datos de formulario inválidos. Por favor, verifique la información.';
    }

    console.error("Error completo en addEnrollment:", error);
    
    return { 
      success: false, 
      error: userMessage, 
      data: null 
    };
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
    printedFilter?: string; // <--- NUEVO PARÁMETRO
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
    if (filters.user === "PUBLIC_USER") {
      where.userId = null;
    } else {
      where.user = {
        name: {
          contains: filters.user,
          mode: 'insensitive',
        },
      };
    }
  }

  const careerWhere: Prisma.CareerWhereInput = {};

  if (filters.career) {
    careerWhere.name = {
      equals: filters.career,
      mode: 'insensitive',
    };
  }

  if (Object.keys(careerWhere).length > 0) {
    where.career = careerWhere;
  }
  
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

  if (filters.documentFilter) {
    if (filters.documentFilter === 'without') {
      where.AND = [
        { cedulaFileFrente: null },
        { cedulaFileReverso: null },
        { birthCertificateFile: null },
        { diplomaFile: null },
        { gradesCertificateFile: null },
      ];
    } else if (filters.documentFilter === 'with') {
      where.OR = [
        { cedulaFileFrente: { not: null } },
        { cedulaFileReverso: { not: null } },
        { birthCertificateFile: { not: null } },
        { diplomaFile: { not: null } },
        { gradesCertificateFile: { not: null } },
      ];
    } else if (filters.documentFilter === 'complete') {
      where.AND = [
        { cedulaFileFrente: { not: null } },
        { cedulaFileReverso: { not: null } },
        { birthCertificateFile: { not: null } },
        { diplomaFile: { not: null } },
        { gradesCertificateFile: { not: null } },
      ];
    }
  }

  // --- FILTRO DE ESTADO DE IMPRESIÓN ---
  if (filters.printedFilter) {
    if (filters.printedFilter === 'printed') {
      where.isPrinted = true;
    } else if (filters.printedFilter === 'not-printed') {
      where.isPrinted = false;
    }
  }
  // -------------------------------------

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
    return { 
      success: false, 
      error: "Matrícula no encontrada.",
      data: null 
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { birthDate, createdAt, userId, user: _user, career: _career, ...rest } = data;
  
  const { carreraTecnica, ...otherData } = rest;
  
  const updateData: Prisma.RegisterUpdateInput = { ...otherData };

  if (birthDate) {
    updateData.birthDate = new Date(birthDate);
  }
  
  if (createdAt) {
    updateData.createdAt = new Date(createdAt);
  }
  
  if (userId !== undefined) {
    updateData.user = userId === null ? { disconnect: true } : { connect: { id: userId } };
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
    revalidatePath(`/register/edit/${id}`);
    revalidatePath('/register');
    
    return { 
      success: true, 
      error: null, 
      data: updatedEnrollment 
    };

  } catch (error) {
      if (newlyUploadedPublicIds.length > 0) {
          await cloudinary.api.delete_resources(newlyUploadedPublicIds).catch(console.error);
      }
      
      let userMessage = 'No se pudo actualizar el registro. Verifique su conexión e intente nuevamente. Si el problema persiste, contacte al administrador.';
      
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const target = (error.meta?.target as string[]) || [];
          if (target.includes('cedula')) {
            userMessage = 'La cédula ingresada ya está registrada en el sistema.';
          }
          if (target.includes('email')) {
            userMessage = 'El correo electrónico ingresado ya está registrado en el sistema.';
          }
        }
        
        if (error.code === 'P2025') {
          userMessage = 'No se encontró el registro solicitado.';
        }
        if (error.code === 'P2003') {
          userMessage = 'Error de referencia: La carrera seleccionada no existe.';
        }
      }

      if (error instanceof Error && error.message.includes('Cloudinary')) {
        userMessage = 'Error al subir los documentos. Por favor, intente nuevamente.';
      }

      if (error instanceof Error && error.message.includes('validation')) {
        userMessage = 'Datos de formulario inválidos. Por favor, verifique la información.';
      }

      console.error("Error completo en updateEnrollment:", error);
      
      return { 
        success: false, 
        error: userMessage, 
        data: null 
      };
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

  const startDate = new Date(2025, 9, 1);
  const today = new Date();

  const yearDiff = today.getFullYear() - startDate.getFullYear();
  const monthDiff = today.getMonth() - startDate.getMonth();
  const totalMonthsToShow = yearDiff * 12 + monthDiff + 1;

  const monthlyEnrollments = await Promise.all(
    Array.from({ length: totalMonthsToShow > 0 ? totalMonthsToShow : 0 }).map(async (_, i) => {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);

      const monthName = date.toLocaleString('es-NI', { month: 'short' });
      const year = date.getFullYear();
      const formattedName = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;

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
    monthlyEnrollments,
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

// ▼▼▼ NUEVA FUNCIÓN PARA EL REPORTE ▼▼▼
export async function getEnrollmentsWithNoDocuments() {
  try {
    const enrollments = await prisma.register.findMany({
      where: {
        AND: [
          { cedulaFileFrente: null },
          { cedulaFileReverso: null },
          { birthCertificateFile: null },
          { diplomaFile: null },
          { gradesCertificateFile: null },
        ],
      },
      orderBy: [
        { carreraTecnica: 'asc' },
        { apellidos: 'asc' },
      ],
      include: {
        career: true,
      },
    });

    // Agrupar por carrera para el reporte
    const groupedByCareer = enrollments.reduce((acc, enrollment) => {
      const careerName = enrollment.carreraTecnica;
      if (!acc[careerName]) {
        acc[careerName] = {
          careerName: careerName,
          shift: enrollment.career?.shift || 'Desconocido',
          students: [],
        };
      }
      acc[careerName].students.push(enrollment);
      return acc;
    }, {} as Record<string, { careerName: string; shift: string; students: Register[] }>);
    
    // Convertir el objeto de carreras en un array
    // @typescript-eslint/ban-ts-comment
    return Object.values(groupedByCareer);

  } catch (error) {
    console.error("Error fetching enrollments with no documents:", error);
    throw new Error("No se pudieron obtener los registros de estudiantes sin documentos.");
  }
}