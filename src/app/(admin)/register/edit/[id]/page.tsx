// src/app/(admin)/register/edit/[id]/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RegisterForm from '@/components/register/register-form';
// MODIFICADO: Importar getUsers
import { getEnrollmentById, getUsers } from '@/lib/actions'; 
import { Register } from '@/lib/types';
import { useCurrentUser } from '@/hooks/use-current-user'; 
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { List, Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User, Role } from '@prisma/client'; // Importar tipos de Prisma para tipado correcto

// Definir tipos auxiliares para claridad y compatibilidad
type UserListItem = Pick<User, 'id' | 'name'>;
// Definir el tipo esperado por RegisterForm para 'user' (asumiendo que solo necesita id, name y role)
type UserFormProp = Pick<User, 'id' | 'name'> & { role?: Role };


export default function EditEnrollmentPage() {
  const params = useParams();
  const router = useRouter(); 
  const { user: currentUser, isLoading: isUserLoading } = useCurrentUser(); 
  
  const [enrollment, setEnrollment] = useState<Register | null>(null);
  const [allUsers, setAllUsers] = useState<UserListItem[]>([]); // NUEVO ESTADO: Lista de usuarios
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false); 

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!id) return;

    // MODIFICADO: Cargar matrícula Y usuarios en paralelo
    const fetchEnrollmentAndUsers = async () => {
      try {
        setIsLoading(true);
        const [data, usersData] = await Promise.all([
            getEnrollmentById(id),
            getUsers(), // <-- Obtener todos los usuarios
        ]);

        if (!data) {
          setError("No se encontró la matrícula especificada.");
        } else {
          setEnrollment(data as Register);
        }
        setAllUsers(usersData); // <-- Guardar los usuarios
      } catch (err) {
        setError("Error al cargar los datos de la matrícula o usuarios.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrollmentAndUsers();
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
      router.push('/register'); 
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
          <h1 className="text-2xl font-bold mb-4">Editar Matrícula: {enrollment.nombres} {enrollment.apellidos}</h1>
          <Button asChild>
            <Link href="/register">
              <List className="mr-2 h-4 w-4" />
              Volver a la Lista
            </Link>
          </Button>
        </div>

        {/* CORRECCIÓN: Se realiza un cast explícito para evitar el error de tipo. */}
        <RegisterForm 
            enrollment={enrollment} 
            allUsers={allUsers}
            user={currentUser as UserFormProp} // <-- FIX APLICADO
        />
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