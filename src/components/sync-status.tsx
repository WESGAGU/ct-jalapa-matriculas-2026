'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getPendingEnrollments, clearPendingEnrollments } from '@/lib/storage';
import { addEnrollment } from '@/lib/actions';

export default function SyncStatus() {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const handleOnline = async () => {
      const pending = getPendingEnrollments();
      if (pending.length > 0) {
        toast({
          title: 'Conexión recuperada',
          description: `Sincronizando ${pending.length} registro(s) pendientes...`,
        });

        try {
          await Promise.all(pending.map(enrollment => addEnrollment(enrollment)));
          
          clearPendingEnrollments();
          
          toast({
            title: 'Sincronización completa',
            description: 'Todos los registros pendientes han sido guardados en el servidor.',
            variant: 'success',
          });
          
          router.refresh();

        } catch (error) {
          console.error('Failed to sync enrollments:', error);
          toast({
            variant: 'destructive',
            title: 'Error de sincronización',
            description: 'No se pudieron guardar los registros pendientes. Se intentará de nuevo más tarde.',
          });
        }
      }
    };

    // Only run on client
    if (typeof window !== 'undefined' && 'onLine' in navigator) {
        window.addEventListener('online', handleOnline);

        // Initial check on load
        if (navigator.onLine) {
            handleOnline();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
        };
    }
  }, [toast, router]);

  return null;
}
