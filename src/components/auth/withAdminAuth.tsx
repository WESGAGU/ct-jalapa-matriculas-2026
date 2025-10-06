'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Este es un Componente de Orden Superior (HOC)
export function withAdminAuth<P extends {}>(Component: React.ComponentType<P>) {
  // Devuelve un nuevo componente que envuelve al original
  return function WithAdminAuth(props: P) {
    const { user, isLoading } = useCurrentUser();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
      // Si la carga ha terminado y el usuario no es ADMIN
      if (!isLoading && user?.role !== 'ADMIN') {
        toast({
          title: 'Acceso Denegado',
          description: 'No tienes permiso para acceder a esta página.',
          variant: 'destructive',
        });
        // Redirige al usuario a la página principal
        router.push('/'); 
      }
    }, [user, isLoading, router, toast]);

    // Muestra un spinner de carga mientras se verifica el rol del usuario
    if (isLoading || user?.role !== 'ADMIN') {
      return (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
    }

    // Si el usuario es ADMIN, muestra la página solicitada
    return <Component {...props} />;
  };
}
