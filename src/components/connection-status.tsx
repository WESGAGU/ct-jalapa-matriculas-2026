'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudOff } from 'lucide-react';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

// -------------------------------------------------------------------
// HOOK EXPORTADO PARA REUTILIZACIÓN
// -------------------------------------------------------------------
/**
 * Custom hook para determinar si el navegador tiene conexión a internet.
 * @returns {boolean} True si está online, False si está offline.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    // Verificación inicial del estado de la red
    if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
        setIsOnline(window.navigator.onLine);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    // Escuchadores de eventos para cambios en el estado de la red
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
// -------------------------------------------------------------------


export default function ConnectionStatus() {
  // Ahora ConnectionStatus consume el hook
  const isOnline = useOnlineStatus();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    // Nota: El chequeo inicial de window.navigator.onLine se hace dentro de useOnlineStatus
    // Aquí solo necesitamos hasMounted para evitar problemas de SSR.

    // El manejo de eventos 'online'/'offline' ahora está centralizado en el hook.
    
  }, []);

  if (!hasMounted) {
    return null;
  }

  const tooltipText = isOnline ? 'Conectado a internet' : 'Sin conexión. Los cambios se guardarán localmente.';
  const badgeVariant = isOnline ? 'outline' : 'destructive';
  const Icon = isOnline ? Cloud : CloudOff;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={badgeVariant} 
            className={`flex items-center gap-2 ${isOnline ? 'border-green-500 bg-green-50 text-green-700' : ''}`}
          >
            <Icon className="h-4 w-4" />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}