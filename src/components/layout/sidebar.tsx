// src/components/layout/sidebar.tsx

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  List,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  FileChartColumnIncreasing,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/use-sidebar';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { useCurrentUser } from '@/hooks/use-current-user'; // Importa el hook para obtener el usuario

// Definimos la lista de items del menú, incluyendo "Usuarios"
// Se añade una propiedad `adminOnly` para un control más sencillo
export const menuItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/new',
    label: 'Ingresar Matrícula',
    icon: FilePlus2,
  },
  {
    href: '/register',
    label: 'Ver Matrículas',
    icon: List,
  },
  {
    href: '/careers',
    label: 'Carreras',
    icon: BookOpen, 
  },
  {
    href: '/reports', 
    label: 'Reportes',
    icon: FileChartColumnIncreasing ,
  },
  {
    href: '/users', 
    label: 'Usuarios',
    icon: Users,
    adminOnly: true, // Esta ruta solo será visible para administradores
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const sidebar = useSidebar();
  const { user } = useCurrentUser(); // Obtiene la información del usuario actual
  const [isCollapsed, setIsCollapsed] = useState(sidebar.isCollapsed);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const unsubscribe = useSidebar.subscribe(
      (state) => setIsCollapsed(state.isCollapsed)
    );
    setIsCollapsed(sidebar.isCollapsed); // Set initial state
    return () => unsubscribe();
  }, [sidebar.isCollapsed]);

  const toggleSidebar = () => {
    sidebar.toggleSidebar();
  };
  
  if (!hasMounted) {
    return null; // Don't render on the server to avoid hydration mismatch
  }

  // Filtra los elementos del menú basados en el rol del usuario
  const filteredMenuItems = menuItems.filter(item => {
    if (item.adminOnly) {
      return user?.role === 'ADMIN';
    }
    return true; // Muestra todos los demás elementos
  });

  const renderMenuItem = (item: typeof menuItems[0]) => {
    const isActive = pathname === item.href;
    if (isCollapsed) {
      return (
        <TooltipProvider key={item.href} delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant={isActive ? 'secondary' : 'ghost'} className="w-full justify-center" size="icon">
                <Link href={item.href}>
                  <item.icon />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Button asChild key={item.href} variant={isActive ? 'secondary' : 'ghost'} className="w-full justify-start">
        <Link href={item.href}>
          <item.icon className="mr-2" />
          {item.label}
        </Link>
      </Button>
    );
  };
  
  return (
    <aside className={cn(
      "flex-col bg-card border-r hidden md:flex transition-[width] duration-300 ease-in-out fixed h-full z-50",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn(
        "flex items-center gap-2 p-4 border-b h-16",
        isCollapsed ? 'justify-center' : 'justify-start'
      )}>
         <GraduationCap className="h-8 w-8 text-primary flex-shrink-0" />
         <h1 className={cn("text-xl font-bold transition-opacity duration-300", isCollapsed ? "opacity-0 w-0" : "opacity-100")}>CT JALAPA</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {/* Renderiza los elementos filtrados */}
        {filteredMenuItems.map(renderMenuItem)}
      </nav>
      <div className="p-4 border-t">
        <Button variant="ghost" onClick={toggleSidebar} className="w-full justify-center">
            {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            <span className="sr-only">{isCollapsed ? 'Expandir' : 'Colapsar'}</span>
        </Button>
      </div>
      <div className="p-4 border-t text-xs text-muted-foreground text-center">
        <span className={cn(isCollapsed ? 'hidden' : 'inline')}>
          © {new Date().getFullYear()} Wes
        </span>
      </div>
    </aside>
  );
}