-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Shift" AS ENUM ('DAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Register" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "estadoCivil" TEXT,
    "cedula" TEXT,
    "municipioNacimiento" TEXT NOT NULL,
    "deptoDomiciliar" TEXT NOT NULL,
    "municipioDomiciliar" TEXT NOT NULL,
    "comunidad" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "numPersonasHogar" INTEGER NOT NULL,
    "telefonoCelular" TEXT NOT NULL,
    "email" TEXT,
    "nivelAcademico" TEXT NOT NULL,
    "carreraTecnica" TEXT NOT NULL,
    "nombreEmergencia" TEXT NOT NULL,
    "parentescoEmergencia" TEXT NOT NULL,
    "telefonoEmergencia" TEXT NOT NULL,
    "direccionParentesco" TEXT,
    "cedulaFileFrente" TEXT,
    "cedulaFileReverso" TEXT,
    "diplomaFile" TEXT,
    "firmaProtagonista" TEXT,
    "userId" TEXT,

    CONSTRAINT "Register_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentRegistration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "estadoCivil" TEXT,
    "cedula" TEXT,
    "municipioNacimiento" TEXT NOT NULL,
    "deptoDomiciliar" TEXT NOT NULL,
    "municipioDomiciliar" TEXT NOT NULL,
    "comunidad" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "numPersonasHogar" INTEGER NOT NULL,
    "telefonoCelular" TEXT NOT NULL,
    "email" TEXT,
    "nivelAcademico" TEXT NOT NULL,
    "careerId" TEXT,
    "nombreEmergencia" TEXT NOT NULL,
    "parentescoEmergencia" TEXT NOT NULL,
    "telefonoEmergencia" TEXT NOT NULL,
    "direccionParentesco" TEXT,
    "cedulaFileFrente" TEXT,
    "cedulaFileReverso" TEXT,
    "diplomaFile" TEXT,
    "firmaProtagonista" TEXT,

    CONSTRAINT "StudentRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Career" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shift" "Shift" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Career_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Register_cedula_key" ON "Register"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "Register_email_key" ON "Register"("email");

-- CreateIndex
CREATE INDEX "Register_userId_idx" ON "Register"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentRegistration_cedula_key" ON "StudentRegistration"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "StudentRegistration_email_key" ON "StudentRegistration"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Career_name_key" ON "Career"("name");

-- AddForeignKey
ALTER TABLE "Register" ADD CONSTRAINT "Register_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentRegistration" ADD CONSTRAINT "StudentRegistration_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE SET NULL ON UPDATE CASCADE;
