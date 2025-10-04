'use client';

import { useEffect, useState } from 'react';
import AppSidebar from './sidebar';
import Header, { MobileHeader } from './header';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const sidebar = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(sidebar.isCollapsed);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const unsubscribe = useSidebar.subscribe(
      (state) => setIsCollapsed(state.isCollapsed)
    );
    setIsCollapsed(sidebar.isCollapsed);
    return () => unsubscribe();
  }, [sidebar.isCollapsed]);
  
  if (!hasMounted) {
    // To prevent hydration mismatch, we render a simplified version on the server
    // or on the first client render. The actual layout is rendered only after mounting.
    return (
        <div className="flex min-h-screen">
            <aside className="flex-col bg-card border-r hidden md:flex transition-[width] duration-300 ease-in-out fixed h-full z-50 w-64" />
            <div className="flex-1 flex flex-col ml-0 md:ml-64">
                 <main className="container flex-1 mx-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className={cn(
        "flex-1 flex flex-col transition-[margin-left] duration-300 ease-in-out",
        isCollapsed ? "ml-0 md:ml-20" : "ml-0 md:ml-64"
      )}>
        <Header />
        <MobileHeader />
        <main className="container flex-1 mx-auto p-4 md:p-6">
            {children}
        </main>
      </div>
    </div>
  );
}
