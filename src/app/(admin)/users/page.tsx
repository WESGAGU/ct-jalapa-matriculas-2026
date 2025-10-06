// src/app/(admin)/users/page.tsx

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import UsersList from "@/components/users/user-list"; // Importamos el componente cliente que crearemos a continuación

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
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