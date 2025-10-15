'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCards from "@/components/dashboard/stats-cards";
import RegisterChart from "@/components/dashboard/register-chart";
import { getEnrollmentStats } from "@/lib/actions";
import RegisterListView from "@/components/dashboard/register-list-view";
import EnrollmentsByCareer from "@/components/dashboard/enrollments-by-career";
import EnrollmentsByMunicipality from "@/components/dashboard/Enrollments-by-municipality";
import EnrollmentsByAcademicLevel from "@/components/dashboard/enrollments-by-academic-level";
import EnrollmentsByAge from "@/components/dashboard/enrollments-by-age";
import { useCurrentUser } from "@/hooks/use-current-user"; // Importamos el hook
import { Skeleton } from "@/components/ui/skeleton"; // Importamos Skeleton para el estado de carga
import { useEffect, useState } from "react";
import ShareLinkCard from "@/components/dashboard/share-link-card"; // Importamos el nuevo componente

// Definimos un tipo para las estadísticas para evitar errores de tipo
type StatsData = Awaited<ReturnType<typeof getEnrollmentStats>>;

export default function Home() {
  const { user } = useCurrentUser(); // Obtenemos el usuario actual
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await getEnrollmentStats();
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ADAPTACIÓN DE DATOS: Transformamos 'enrollmentsByLocation' para el gráfico
  const municipalityData = stats ? stats.enrollmentsByLocation.map(location => ({
    name: location.municipio,
    total: location.comunidades.reduce((sum, community) => sum + community.total, 0),
  })) : [];

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="col-span-1 lg:col-span-2 h-[450px]" />
                <Skeleton className="col-span-1 h-[450px]" />
            </div>
        </div>
    );
  }

  if (!stats) {
    return <div>Error al cargar los datos del dashboard.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          {/* Mensaje de bienvenida */}
          {user?.name && (
            <p className="text-lg text-muted-foreground mt-3">
              ¡Bienvenido, {user.name}!
            </p>
          )}
        </div>
      </div>
      
      {/* Componente para compartir el enlace */}
      <ShareLinkCard />
      
      <StatsCards stats={stats} />

      {/* --- FILA MODIFICADA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta del gráfico de meses */}
        <Card className="col-span-1 lg:col-span-2 flex flex-col h-[450px]">
          <CardHeader>
            <CardTitle>Matrículas en los Meses</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <RegisterChart data={stats.monthlyEnrollments} />
          </CardContent>
        </Card>

        {/* Tarjeta de matrículas por carrera */}
        <Card className="col-span-1 flex flex-col h-[450px]">
          <CardHeader>
            <CardTitle>Matrículas por carrera</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <EnrollmentsByCareer data={stats.enrollmentsByCareer} />
          </CardContent>
        </Card>
      </div>
        
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estudiantes Matriculados Recientemente</CardTitle>
          </CardHeader>
          <CardContent>
            <RegisterListView />
          </CardContent>
        </Card>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Procedencia de Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Se pasan los datos ya transformados */}
            <EnrollmentsByMunicipality data={municipalityData}/>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Matrículas por nivel académico </CardTitle>
          </CardHeader>
          <CardContent>
            <EnrollmentsByAcademicLevel data={stats.enrollmentsByAcademicLevel}/>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Edades</CardTitle>
          </CardHeader>
          <CardContent>
            <EnrollmentsByAge data={stats.enrollmentsByAge}/>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}