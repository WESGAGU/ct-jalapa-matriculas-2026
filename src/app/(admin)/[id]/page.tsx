"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RegisterForm from '@/components/register/register-form';
import { getEnrollmentById } from '@/lib/actions';
import { Register } from '@/lib/types';
import { useCurrentUser } from '@/hooks/use-current-user'; // 1. Importar el hook de usuario
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { List, Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function EditEnrollmentPage() {
  const params = useParams();
  const router = useRouter(); // 2. Importar el router para redirección
  const { user: currentUser, isLoading: isUserLoading } = useCurrentUser(); // 3. Obtener el usuario actual
  
  const [enrollment, setEnrollment] = useState<Register | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false); // 4. Estado para controlar la autorización

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!id) return;

    const fetchEnrollment = async () => {
      try {
        setIsLoading(true);
        const data = await getEnrollmentById(id);
        if (!data) {
          setError("No se encontró la matrícula especificada.");
        } else {
          setEnrollment(data as Register);
        }
      } catch (err) {
        setError("Error al cargar los datos de la matrícula.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrollment();
  }, [id]);

  // 5. EFECTO PARA LA VALIDACIÓN DE PERMISOS
  useEffect(() => {
    // Solo proceder si ya tenemos los datos del usuario y la matrícula
    if (isUserLoading || isLoading || !enrollment || !currentUser) {
      return;
    }

    const isAdmin = currentUser.role === 'ADMIN';
    const isOwner = currentUser.id === enrollment.userId;

    // Si el usuario NO es admin Y NO es el propietario, no está autorizado
    if (!isAdmin && !isOwner) {
      // Opción 1: Redirigir a la lista de registros
      router.push('/register'); 

      // Opción 2: O simplemente marcar como no autorizado para mostrar un mensaje
      // setIsAuthorized(false);
    } else {
      // Si cumple las condiciones, autorizar el acceso
      setIsAuthorized(true);
    }
  }, [currentUser, enrollment, isUserLoading, isLoading, router]);


  // --- Renderizado Condicional ---

  // Estado de carga principal mientras se obtienen datos
  if (isLoading || isUserLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  // Si hubo un error al buscar la matrícula
  if (error) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Si el usuario está autorizado y tenemos los datos, mostrar el formulario
  if (isAuthorized && enrollment) {
    return (
      <div>
        <div className='flex items-center justify-between mb-4'>
          <h1 className="text-2xl font-bold mb-4">Editar Matrícula</h1>
          <Button asChild>
            <Link href="/register">
              <List className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>

        <RegisterForm enrollment={enrollment} />
      </div>
    );
  }

  // Renderizado por defecto o si la autorización aún está en proceso
  // Muestra un loader para evitar parpadeos mientras se valida
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/4" />
      <Skeleton className="h-96 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}