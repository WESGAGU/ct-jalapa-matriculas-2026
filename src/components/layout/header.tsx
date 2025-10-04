// src/components/layout/header.tsx
'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ModeToggle } from '../mode-toggle';
import { Button } from '../ui/button';
import { Download, GraduationCap, Menu } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/use-install-prompt';
import ConnectionStatus from '../connection-status';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { menuItems } from './sidebar';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import placeholderImages from '@/lib/placeholder-images.json';
import Image from 'next/image';

// Wrapper to ensure a component only renders on the client
const ClientOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};


export default function Header() {
  const [installPrompt, handleInstallClick] = useInstallPrompt();
  const userAvatar = placeholderImages.userAvatar;
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
    });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="bg-card border-b sticky top-0 z-40 hidden md:flex">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-end h-16 gap-4">
          <ClientOnly>
            <ConnectionStatus />
            {installPrompt && (
              <Button variant="ghost" size="icon" onClick={handleInstallClick}>
                <Download />
                <span className="sr-only">Instalar App</span>
              </Button>
            )}
          </ClientOnly>
           <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className='cursor-pointer'>
                    <Image src={userAvatar.src} alt={userAvatar.alt} width={40} height={40} data-ai-hint={userAvatar.hint} />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/settings">Configuración</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export function MobileHeader() {
    const [installPrompt, handleInstallClick] = useInstallPrompt();
    const pathname = usePathname();
    const userAvatar = placeholderImages.userAvatar;
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/logout', {
          method: 'POST',
        });
        router.push('/login');
        router.refresh();
      };

    return (
        <header className="md:hidden bg-card border-b sticky top-0 z-40">
             <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-16">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Menu />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="p-0">
                         <SheetHeader className="p-4 border-b">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-8 w-8 text-primary" />
                               <SheetTitle className="text-xl font-bold">CETA JALAPA</SheetTitle>
                            </div>
                         </SheetHeader>
                         <div className="p-4 space-y-2">
                           {menuItems.map((item) => (
                              <SheetTrigger asChild key={item.href}>
                                <Button asChild variant={pathname === item.href ? 'secondary' : 'ghost'} className="w-full justify-start">
                                  <Link href={item.href}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.label}
                                  </Link>
                                </Button>
                              </SheetTrigger>
                            ))}
                         </div>
                      </SheetContent>
                    </Sheet>

                    <div className="flex items-center gap-2">
                      <ClientOnly>
                        <ConnectionStatus />
                         {installPrompt && (
                          <Button variant="ghost" size="icon" onClick={handleInstallClick}>
                              <Download />
                              <span className="sr-only">Instalar App</span>
                          </Button>
                        )}
                      </ClientOnly>
                      <ModeToggle />
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className='cursor-pointer h-8 w-8'>
                                <Image src={userAvatar.src} alt={userAvatar.alt} width={32} height={32} data-ai-hint={userAvatar.hint} />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/settings">Configuración</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    )
}