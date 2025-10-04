import RegisterForm from "@/components/register/register-form";
import { getEnrollmentById } from "@/lib/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { notFound } from "next/navigation";
import { getPendingEnrollments } from "@/lib/storage";
import type { Register, User } from "@/lib/types";
import { Register as PrismaEnrollment } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
import Link from "next/link";
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Función para obtener la sesión desde la cookie
async function getSession() {
  // Corregido: Usar 'await' para esperar la promesa de las cookies
  const cookiesStore = await cookies();
  const sessionCookie = cookiesStore.get('session')?.value;

  if (!sessionCookie) return null;

  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      throw new Error('La variable de entorno AUTH_SECRET no está definida');
    }
    const key = new TextEncoder().encode(secret);
    
    const { payload } = await jwtVerify(sessionCookie, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error('Fallo al verificar la sesión:', error);
    return null;
  }
}

export default async function EditRegisterPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  const pending = getPendingEnrollments();
  let enrollment: Register | PrismaEnrollment | undefined = pending.find(
    (e) => e.id === params.id
  );

  if (!enrollment) {
    enrollment = (await getEnrollmentById(params.id)) || undefined;
  }

  if (!enrollment) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-3">
          <CardTitle className="text-2xl">Editar Matrícula</CardTitle>
          <Button asChild>
            <Link href="/register">
              <List className="mr-2 h-4 w-4" />
              Ver Matrículas
            </Link>
          </Button>
        </div>

        <CardDescription>
          Actualice la información del estudiante. Los cambios se guardarán
          localmente si no hay conexión a internet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Pasamos el usuario y la matrícula como props */}
        <RegisterForm enrollment={enrollment} user={session?.user as User | undefined} />
      </CardContent>
    </Card>
  );
}