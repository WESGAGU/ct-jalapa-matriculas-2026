import type { Career } from '@prisma/client';

export interface Register {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Section 1: DATOS PERSONALES
  nombres: string;
  apellidos: string;
  birthDate: Date;
  gender: string;
  estadoCivil?: string | null;
  cedula?: string | null;
  municipioNacimiento: string;
  deptoDomiciliar: string;
  municipioDomiciliar: string;
  comunidad: string;
  direccion: string;
  numPersonasHogar: number;
  telefonoCelular: string;
  email?: string | null;
  nivelAcademico: string;

  // Section 2: CARRERA TÉCNICA
  carreraTecnica: string;

  // Section 3: EN CASO DE EMERGENCIA
  nombreEmergencia: string;
  parentescoEmergencia: string;
  telefonoEmergencia: string;
  direccionParentesco?: string | null;

  // Documents & Signature
  cedulaFileFrente?: string | null;
  cedulaFileReverso?: string | null;
  birthCertificateFile?: string | null;
  diplomaFile?: string | null;
  gradesCertificateFile?: string | null;
  firmaProtagonista?: string | null;

  // Relación con usuario
  userId?: string | null;
  user?: {
    name: string | null;
  } | null;

  // Relación con Career
  career?: Career | null;
}

export interface User {
  id: string;
  name?: string | null;
  email: string;
  password: string;
  // Agrega aquí otros campos si los necesitas, como 'role'
}