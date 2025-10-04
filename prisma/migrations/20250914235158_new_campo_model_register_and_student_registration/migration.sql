/*
  Warnings:

  - The values [DAY,SATURDAY,SUNDAY] on the enum `Shift` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Shift_new" AS ENUM ('DIURNO', 'SABATINO', 'DOMINICAL');
ALTER TABLE "Career" ALTER COLUMN "shift" TYPE "Shift_new" USING ("shift"::text::"Shift_new");
ALTER TYPE "Shift" RENAME TO "Shift_old";
ALTER TYPE "Shift_new" RENAME TO "Shift";
DROP TYPE "Shift_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Register" DROP CONSTRAINT "Register_userId_fkey";

-- DropForeignKey
ALTER TABLE "StudentRegistration" DROP CONSTRAINT "StudentRegistration_careerId_fkey";

-- AlterTable
ALTER TABLE "Register" ADD COLUMN     "birthCertificateFile" TEXT;

-- AlterTable
ALTER TABLE "StudentRegistration" ADD COLUMN     "birthCertificateFile" TEXT;
