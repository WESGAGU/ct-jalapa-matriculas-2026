import RegisterForm from "@/components/register/register-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { List } from "lucide-react";
import Link from "next/link";
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import type { User } from "@/lib/types";

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

export default async function NewRegisterPage() {
  const session = await getSession();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-5">
          <CardTitle className="text-2xl">Nueva Matrícula</CardTitle>
          <Button asChild>
            <Link href="/register">
              <List className="mr-2 h-4 w-4" />
              Ver Matrículas
            </Link>
          </Button>
        </div>

        <CardDescription>
          Complete el formulario para registrar un nuevo estudiante. Los datos
          se guardarán localmente si no hay conexión a internet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Pasamos el usuario como prop */}
        <RegisterForm user={session?.user as User | undefined} />
      </CardContent>
    </Card>
  );
}