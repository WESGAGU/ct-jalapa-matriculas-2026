'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import UsersList from "@/components/users/user-list";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function UsersPage() {
  const { user: currentUser, isLoading: isUserLoading } = useCurrentUser();

  // Muestra un estado de carga mientras se obtiene la información del usuario
  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        {/* Renderizado condicional del botón basado en el rol del hook */}
        {isAdmin && (
          <Button asChild>
            <Link href="/users/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Usuario
            </Link>
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>
            Aquí puedes ver y administrar los usuarios del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersList />
        </CardContent>
      </Card>
    </div>
  );
}

