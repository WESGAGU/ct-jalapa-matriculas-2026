'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import UsersList from "@/components/users/user-list";
import { withAdminAuth } from "../../../components/auth/withAdminAuth"; // Importacion  del HOC

function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        {/* El botón ya solo es visible para admins gracias al HOC */}
        <Button asChild>
          <Link href="/users/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Usuario
          </Link>
        </Button>
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

// Envuelve el componente con el HOC para proteger la ruta
export default withAdminAuth(UsersPage);