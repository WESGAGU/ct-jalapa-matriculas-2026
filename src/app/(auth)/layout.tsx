export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="relative mx-auto flex w-full max-w-sm flex-col space-y-2.5 p-4">
        {children}
      </div>
    </main>
  );
}