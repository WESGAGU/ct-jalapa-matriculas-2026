import React from 'react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-white dark:bg-background">
      <div className="w-full max-w-6xl">
        {children}
      </div>
    </main>
  );
}