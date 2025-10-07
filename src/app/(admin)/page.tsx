import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCards from "@/components/dashboard/stats-cards";
import RegisterChart from "@/components/dashboard/register-chart";
import { getEnrollmentStats } from "@/lib/actions";
import RegisterListView from "@/components/dashboard/register-list-view";
import EnrollmentsByCareer from "@/components/dashboard/enrollments-by-career"; 
import EnrollmentsByMunicipality from "@/components/dashboard/Enrollments-by-municipality";
import EnrollmentsByAcademicLevel from "@/components/dashboard/enrollments-by-academic-level";
import EnrollmentsByAgeRange from "@/components/dashboard/enrollments-by-age";

export default async function Home() {
  const stats = await getEnrollmentStats();

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Matrículas en los Últimos 12 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <RegisterChart data={stats.monthlyEnrollments} />
          </CardContent>
        </Card>

         <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Matrículas por carrera</CardTitle>
          </CardHeader>
          <CardContent>
            <EnrollmentsByCareer data={stats.enrollmentsByCareer} />
          </CardContent>
        </Card>
      </div>
        
      <div className="grid grid-cols-1  gap-6">
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
            <EnrollmentsByMunicipality data={stats.enrollmentsByMunicipality}/>
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
            <EnrollmentsByAgeRange data={stats.enrollmentsByAge}/>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
