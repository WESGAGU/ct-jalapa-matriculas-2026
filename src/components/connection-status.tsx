'use client';

import { useEffect, useState } from 'react';
import { Cloud, CloudOff } from 'lucide-react';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Initial check
    if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
        setIsOnline(window.navigator.onLine);
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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
