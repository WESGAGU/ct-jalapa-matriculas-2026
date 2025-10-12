"use client"; // Necesario para usar hooks

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import CareerList from "@/components/careers/career-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/use-current-user"; // Importar el hook

export default function CareersPage() {
  const session = useCurrentUser(); // Obtener la sesión actual
  const isAdmin = session.user?.role === 'ADMIN'; // Verificar si es admin

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestión de Carreras</h1>
        {/* Renderizado condicional del botón */}
        {isAdmin && (
          <Button asChild>
            <Link href="/careers/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Carrera
            </Link>
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Carreras Técnicas</CardTitle>
          <CardDescription>
            Administra las carreras técnicas disponibles en el centro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CareerList />
        </CardContent>
      </Card>
    </div>
  );
}