'use client';

import { useState, useEffect, useMemo } from "react";
import { pdf, PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2, Eye, BarChart, GraduationCap, FileWarning } from 'lucide-react';
import { StatisticalReportPDF } from '@/components/reports/StatisticalReport';
import { DetailedCareerReportPDF } from '@/components/reports/DetailedCareerReport';
import { NoDocumentsReportPDF } from '@/components/reports/NoDocumentsReport';
import { getEnrollmentStats, getCareers, getEnrollmentsByCareer, getEnrollmentsWithNoDocuments } from '@/lib/actions';
import type { Register } from "@/lib/types";
import type { Career } from "@prisma/client";

type ReportType = 'estadistico' | 'detallePorCarrera' | 'sinDocumentos';
type StatsData = Awaited<ReturnType<typeof getEnrollmentStats>>;

// --- (SOLUCIÓN) Se define un tipo explícito para los datos del reporte ---
type NoDocsData = {
  careerName: string;
  shift: string;
  students: Register[];
}[];

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string>('');
  
  const [stats, setStats] = useState<StatsData | null>(null);
  const [careers, setCareers] = useState<Career[]>([]);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [isClient, setIsClient] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reportDocument, setReportDocument] = useState<React.ReactElement | null>(null);
  const [reportFileName, setReportFileName] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsClient(true);
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
      if (!acc[shift]) acc[shift] = [];
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
      alert("Por favor, selecciona una carrera.");
      return;
    }

    setIsGenerating(true);
    let documentToRender;
    let fileName = `Reporte_${new Date().toLocaleDateString()}.pdf`;

    try {
      if (reportType === 'estadistico') {
        if (!stats) return;
        documentToRender = <StatisticalReportPDF stats={stats} />;
        fileName = `Reporte_Estadistico_General.pdf`;
      } else if (reportType === 'detallePorCarrera') {
        const enrollmentsForCareer = await getEnrollmentsByCareer(selectedCareer);
        const careerDetails = careers.find(c => c.name === selectedCareer);
        const shift = careerDetails ? careerDetails.shift : 'Desconocido';
        documentToRender = (
          <DetailedCareerReportPDF 
            enrollments={enrollmentsForCareer as Register[]} 
            careerName={selectedCareer}
            careerShift={shift}
          />
        );
        fileName = `Reporte_Detallado_${selectedCareer.replace(/ /g, '_')}.pdf`;
      } else if (reportType === 'sinDocumentos') {
        const data = await getEnrollmentsWithNoDocuments();
        // --- (SOLUCIÓN) Se elimina el 'as any' y se usa el tipo correcto ---
        documentToRender = <NoDocumentsReportPDF data={data as NoDocsData} />;
        fileName = `Reporte_Estudiantes_Sin_Documentos.pdf`;
      }

      if (!documentToRender) {
        setIsGenerating(false);
        return;
      }
      
      if (action === 'view') {
        if (isMobile) {
          const blob = await pdf(documentToRender).toBlob();
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
        } else {
          setReportDocument(documentToRender);
          setReportFileName(fileName);
          setIsDialogOpen(true);
        }
      } else { 
        const blob = await pdf(documentToRender).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => setReportType("estadistico")} className={`flex flex-col items-center h-28 justify-center gap-2 border-2 transition-all text-center text-sm p-2 ${ reportType === "estadistico" ? selectedClasses : unselectedClasses }`}>
                  <BarChart className="h-7 w-7" />
                  <span>Reporte Estadístico</span>
                </Button>
                <Button onClick={() => setReportType("detallePorCarrera")} className={`flex flex-col items-center h-28 justify-center gap-2 border-2 transition-all text-center text-sm p-2 ${ reportType === "detallePorCarrera" ? selectedClasses : unselectedClasses }`}>
                  <GraduationCap className="h-7 w-7" />
                  <span>Listado por Carrera</span>
                </Button>
                <Button onClick={() => setReportType("sinDocumentos")} className={`flex flex-col items-center h-28 justify-center gap-2 border-2 transition-all text-center text-sm p-2 ${ reportType === "sinDocumentos" ? selectedClasses : unselectedClasses }`}>
                  <FileWarning className="h-7 w-7" />
                  <span>Estudiantes sin Docs.</span>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Previsualización de Reporte</DialogTitle>
            <DialogDescription>
              Vista previa del reporte generado. Puedes descargarlo desde aquí.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-md my-4">
            {isClient && reportDocument && (
              <PDFViewer style={{ width: "100%", height: "100%" }}>
                {reportDocument}
              </PDFViewer>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cerrar
            </Button>
            {isClient && reportDocument && (
              <PDFDownloadLink
                document={reportDocument}
                fileName={reportFileName}
              >
                {({ loading }) => (
                  <Button disabled={loading}>
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? "Generando..." : "Descargar PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}