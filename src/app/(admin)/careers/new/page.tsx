"use client"; // 1. Añadir "use client" para que el HOC funcione

import CareerForm from "@/components/careers/career-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { withAdminAuth } from "@/components/auth/withAdminAuth"; // 2. Importar el HOC

// 3. Convertir el componente a una función nombrada
function NewCareerPage() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Crear Nueva Carrera</CardTitle>
        <CardDescription>
          Añade una nueva carrera técnica al sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CareerForm />
      </CardContent>
    </Card>
  );
}

// 4. Exportar el componente envuelto en el HOC
export default withAdminAuth(NewCareerPage);