// src/app/(admin)/reports/page.tsx

'use client';

import { useState, useEffect, useMemo } from "react";
import { pdf } from '@react-pdf/renderer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2, Eye, BarChart, GraduationCap } from 'lucide-react';
import { StatisticalReportPDF } from '@/components/reports/StatisticalReport';
import { DetailedCareerReportPDF } from '@/components/reports/DetailedCareerReport';
import { getEnrollmentStats, getCareers, getEnrollmentsByCareer } from '@/lib/actions';
import type { Register } from "@/lib/types";
import type { Career } from "@prisma/client";

// Tipos de reportes simplificados
type ReportType = 'estadistico' | 'detallePorCarrera';

type StatsData = Awaited<ReturnType<typeof getEnrollmentStats>>;

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string>('');
  
  const [stats, setStats] = useState<StatsData | null>(null);
  const [careers, setCareers] = useState<Career[]>([]);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [statsData, careersData] = await Promise.all([
          getEnrollmentStats(),
          getCareers()
        ]);
        setStats(statsData);
        setCareers(careersData);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadInitialData();
  }, []);

  const groupedCareers = useMemo(() => {
    return careers.reduce((acc, career) => {
      const shift = career.shift || 'General';
      if (!acc[shift]) {
        acc[shift] = [];
      }
      acc[shift].push(career);
      return acc;
    }, {} as Record<string, Career[]>);
  }, [careers]);

  const handleGenerateReport = async (action: 'view' | 'download') => {
    if (!reportType) {
      alert("Por favor, selecciona un tipo de reporte.");
      return;
    }
    if (reportType === 'detallePorCarrera' && !selectedCareer) {
      alert("Por favor, selecciona una carrera para generar el listado detallado.");
      return;
    }

    setIsGenerating(true);
    let document;
    let fileName = `Reporte_${new Date().toLocaleDateString()}.pdf`;

    try {
      if (reportType === 'estadistico') {
        if (!stats) return;
        document = <StatisticalReportPDF stats={stats} />;
        fileName = `Reporte_Estadistico_General.pdf`;

      } else if (reportType === 'detallePorCarrera') {
        const enrollmentsForCareer = await getEnrollmentsByCareer(selectedCareer);

        // --- INICIO DE LA CORRECCIÓN ---
        // Buscamos la carrera seleccionada para obtener su turno
        const careerDetails = careers.find(c => c.name === selectedCareer);
        const shift = careerDetails ? careerDetails.shift : 'Desconocido';

        document = (
          <DetailedCareerReportPDF 
            enrollments={enrollmentsForCareer as Register[]} 
            careerName={selectedCareer}
            careerShift={shift} // <-- Pasamos el turno al componente
          />
        );
        // --- FIN DE LA CORRECCIÓN ---

        fileName = `Reporte_Detallado_${selectedCareer.replace(/ /g, '_')}.pdf`;
      }

      if (!document) {
        setIsGenerating(false);
        return;
      }
      
      const blob = await pdf(document).toBlob();
      const url = URL.createObjectURL(blob);

      if (action === 'view') {
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 2000);
      } else { // 'download'
        const link = window.document.createElement('a');
        link.href = url;
        link.download = fileName;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al generar el reporte.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const unselectedClasses = "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600/50";
  const selectedClasses = "bg-blue-600 text-white border-blue-600 shadow-lg hover:bg-blue-600/90";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generador de Reportes de Matrícula</CardTitle>
          <CardDescription>
            Elige un reporte, aplica los filtros y obtén tu documento en PDF al instante.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-3 block">1. Selecciona un tipo de reporte</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={() => setReportType("estadistico")} className={`flex flex-col items-center h-28 justify-center gap-2 border-2 transition-all text-center text-sm p-2 ${ reportType === "estadistico" ? selectedClasses : unselectedClasses }`}>
                  <BarChart className="h-7 w-7" />
                  <span>Reporte Estadístico</span>
                </Button>
                <Button onClick={() => setReportType("detallePorCarrera")} className={`flex flex-col items-center h-28 justify-center gap-2 border-2 transition-all text-center text-sm p-2 ${ reportType === "detallePorCarrera" ? selectedClasses : unselectedClasses }`}>
                  <GraduationCap className="h-7 w-7" />
                  <span>Listado Detallado por Carrera</span>
                </Button>
              </div>
            </div>

            {reportType === "detallePorCarrera" && (
              <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50 space-y-4 animate-in fade-in-50">
                <label className="text-sm font-medium mb-2 block">2. Elige la carrera que deseas reportar</label>
                <Select value={selectedCareer} onValueChange={setSelectedCareer}>
                  <SelectTrigger className="bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Selecciona una carrera técnica..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(groupedCareers).map(([shift, careerList]) => (
                      <SelectGroup key={shift}>
                        <SelectLabel>{shift}</SelectLabel>
                        {careerList.map(career => (
                          <SelectItem key={career.id} value={career.name}>
                            {career.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <Button onClick={() => handleGenerateReport('view')} disabled={isGenerating || !reportType || isLoadingData} className="flex-1">
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                {isGenerating ? 'Generando...' : 'Previsualizar'}
              </Button>
              <Button onClick={() => handleGenerateReport('download')} disabled={isGenerating || !reportType || isLoadingData} className="flex-1">
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                {isGenerating ? 'Generando...' : 'Descargar PDF'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}