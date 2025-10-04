import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import AppLayout from '@/components/layout/app-layout';

// Función para obtener la sesión desde la cookie
async function getSession() {
  // ========= LA CORRECCIÓN ESTÁ AQUÍ =========
  // Usamos 'await' para esperar la promesa de las cookies antes de usar .get()
  const cookiesStore = await cookies();
  const sessionCookie = cookiesStore.get('session')?.value;

  if (!sessionCookie) return null;

  try {
    // La clave secreta DEBE estar en tus variables de entorno
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
    // Si el token es inválido o ha expirado, no hay sesión
    console.error('Fallo al verificar la sesión:', error);
    return null;
  }
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Si no hay sesión (o no hay usuario en la sesión), redirige a la página de login
  if (!session?.user) {
    redirect('/login');
  }

  // Si hay sesión, muestra el layout y las páginas de admin
  return <AppLayout>{children}</AppLayout>;
}