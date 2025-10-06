// src/lib/actions.ts

'use server';

import { revalidatePath } from 'next/cache';
import type { Register } from './types';
import prisma from './prisma';
import cloudinary from './cloudinary';
import { Prisma } from '@prisma/client';
import { sendConfirmationEmail } from '@/lib/sendEmailBrevo';

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
    return { url: dataUri || null, publicId: null };
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
  const { id, user: _user, userId: _userId, ...rest } = enrollment;

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
    // Helper to upload and track public IDs
    const uploadAndTrack = async (dataUri: string | undefined | null) => {
      if (!dataUri || !dataUri.startsWith('data:image')) {
        return dataUri;
      }
      const { url, publicId } = await uploadImage(dataUri);
      if (publicId) {
        uploadedImagePublicIds.push(publicId);
      }
      return url;
    };
    
    // 2. Upload images and get URLs
    const cedulaFrenteUrl = await uploadAndTrack(rest.cedulaFileFrente);
    const cedulaReversoUrl = await uploadAndTrack(rest.cedulaFileReverso);
    const birthCertificateUrl = await uploadAndTrack(rest.birthCertificateFile);
    const diplomaUrl = await uploadAndTrack(rest.diplomaFile);
    const gradesCertificateUrl = await uploadAndTrack(rest.gradesCertificateFile);
    const firmaUrl = await uploadAndTrack(rest.firmaProtagonista);

    const createData: Prisma.RegisterCreateInput = {
      ...rest,
      id,
      birthDate: new Date(enrollment.birthDate),
      cedulaFileFrente: cedulaFrenteUrl,
      cedulaFileReverso: cedulaReversoUrl,
      birthCertificateFile: birthCertificateUrl,
      diplomaFile: diplomaUrl,
      gradesCertificateFile: gradesCertificateUrl,
      firmaProtagonista: firmaUrl,
      user: userId ? { connect: { id: userId } } : undefined,
    };

    const newEnrollment = await prisma.register.create({ data: createData });

    // Send confirmation email
    if (newEnrollment.email) {
      try {
        await sendConfirmationEmail(newEnrollment as Register);
      } catch (emailError) {
        console.error("La matrícula se guardó, pero falló el envío del correo de confirmación:", emailError);
      }
    }

    revalidatePath('/');
    revalidatePath(`/${newEnrollment.id}`);
    revalidatePath('/register');
    return newEnrollment;

  } catch (error) {
    // Rollback: Delete uploaded images if an error occurred
    if (uploadedImagePublicIds.length > 0) {
      console.log(`Error during database operation. Deleting ${uploadedImagePublicIds.length} uploaded images...`);
      // Use destroy for multiple deletions
      await cloudinary.api.delete_resources(uploadedImagePublicIds);
    }

    // Handle specific Prisma errors and re-throw
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta?.target as string[]) || [];
      if (target.includes('cedula')) {
        throw new Error('Error: La cédula ingresada ya existe.');
      }
      if (target.includes('email')) {
        throw new Error('Error: El correo electrónico ingresado ya existe.');
      }
    }
    throw error;
  }
}

export async function getEnrollments(
  page = 1,
  limit = 5,
  filters: { date?: string; user?: string; career?: string } = {}
) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const skip = (page - 1) * limit;

  const where: Prisma.RegisterWhereInput = {};

  if (filters.date) {
    // --- INICIO DE LA CORRECCIÓN DE FECHA ---
    // El string filters.date viene en formato "YYYY-MM-DD".
    // Dividirlo previene problemas de zona horaria, creando la fecha en la zona horaria local del servidor.
    const [year, month, day] = filters.date.split('-').map(Number);

    // Creamos la fecha de inicio a las 00:00 del día seleccionado.
    // El mes en el constructor de Date es 0-indexado (0=Enero), por eso restamos 1.
    const startOfDay = new Date(year, month - 1, day);

    // Creamos la fecha de fin para que sea el inicio del día siguiente.
    const endOfDay = new Date(year, month - 1, day + 1);

    where.createdAt = {
      gte: startOfDay, // Mayor o igual que el inicio del día seleccionado.
      lt: endOfDay,    // Menor que el inicio del día siguiente.
    };
    // --- FIN DE LA CORRECCIÓN DE FECHA ---
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
    where.carreraTecnica = {
      contains: filters.career,
      mode: 'insensitive',
    };
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
  const { birthDate, user: _user, userId: _userId, ...rest } = data;
  const updateData: Prisma.RegisterUpdateInput = { ...rest };

  if (birthDate) {
    updateData.birthDate = new Date(birthDate);
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
    
    // If update is successful, delete old images
    if (publicIdsToDelete.length > 0) {
      await cloudinary.api.delete_resources(publicIdsToDelete);
    }

    revalidatePath('/');
    revalidatePath(`/${id}`);
    revalidatePath('/register');
    return updatedEnrollment;

  } catch (error) {
      // If update fails, delete newly uploaded images
      if (newlyUploadedPublicIds.length > 0) {
          await cloudinary.api.delete_resources(newlyUploadedPublicIds);
      }
      throw error; // Re-throw the original error
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
    enrollmentsByMunicipalityRaw,
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
      by: ['municipioDomiciliar'],
      _count: { municipioDomiciliar: true },
      orderBy: { _count: { municipioDomiciliar: 'desc' } },
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

  const monthlyEnrollments = await Promise.all(
    Array.from({ length: 12 }).map(async (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = date.toLocaleString('es-NI', { month: 'short' });
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const count = await prisma.register.count({ where: { createdAt: { gte: start, lte: end } } });
      return { name: `${month.charAt(0).toUpperCase()}${month.slice(1)}.`, total: count };
    })
  );
  
  const careersMap = new Map(allCareers.map(c => [c.name, c.shift]));

  const enrollmentsByCareer = enrollmentsByCareerRaw.map(item => ({
    name: item.carreraTecnica,
    total: item._count.carreraTecnica,
    shift: careersMap.get(item.carreraTecnica) || 'DESCONOCIDO',
  }));

  const enrollmentsByMunicipality = enrollmentsByMunicipalityRaw.map(item => ({
    name: item.municipioDomiciliar,
    total: item._count.municipioDomiciliar,
  }));

  const enrollmentsByAcademicLevel = enrollmentsByAcademicLevelRaw.map(item => ({
    name: item.nivelAcademico,
    total: item._count.nivelAcademico,
  }));

  const ageRanges = {
    '14-17': 0,
    '18-21': 0,
    '22+': 0,
  };

  allEnrollmentsForAge.forEach(enrollment => {
    const age = calculateAge(enrollment.birthDate);
    if (age >= 14 && age <= 17) {
      ageRanges['14-17']++;
    } else if (age >= 18 && age <= 21) {
      ageRanges['18-21']++;
    } else if (age >= 22) {
      ageRanges['22+']++;
    }
  });

  const enrollmentsByAgeRange = Object.entries(ageRanges).map(([range, total]) => ({
    name: range,
    total,
  }));


  return {
    totalEnrollments,
    monthlyTotal,
    monthlyEnrollments: monthlyEnrollments.reverse(),
    enrollmentsByCareer,
    enrollmentsByMunicipality,
    enrollmentsByAcademicLevel,
    enrollmentsByAgeRange,
  };
}

export async function getCareers() {
  return await prisma.career.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
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