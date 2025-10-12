'use client';

import { useState, useEffect, useCallback } from 'react';
// 1. Importar 'Document'
import { PDFDownloadLink, PDFViewer, usePDF, Document } from '@react-pdf/renderer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Eye, X } from 'lucide-react';
import { StatisticalReportPDF } from '@/components/reports/StatisticalReport';
import { getEnrollmentStats } from '@/lib/actions';
import { useIsMobile } from '@/hooks/use-mobile';

type StatsData = Awaited<ReturnType<typeof getEnrollmentStats>>;

export default function ReportsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const isMobile = useIsMobile();

  // 2. CORRECCIÓN: Definir el documento fuera del hook.
  // Proporcionar un <Document /> vacío si 'stats' no está listo.
  const pdfDocument = stats ? <StatisticalReportPDF stats={stats} /> : <Document />;
  
  // El hook ahora siempre recibe un documento válido y se actualiza solo cuando 'pdfDocument' cambia.
  const [pdfInstance] = usePDF({ document: pdfDocument });

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const statsData = await getEnrollmentStats();
      setStats(statsData);
    } catch (error) {
      console.error("Error al cargar las estadísticas:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);
  
  // 3. CORRECCIÓN: El useEffect que llamaba a 'updatePdfInstance' ya no es necesario y se ha eliminado.

  const handlePreviewClick = () => {
    if (isMobile) {
      if (!pdfInstance.loading && pdfInstance.url) {
        window.open(pdfInstance.url, '_blank');
      }
    } else {
      setShowPreview(!showPreview);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Generar Reportes</CardTitle>
          <CardDescription>
            Previsualiza y descarga los reportes estadísticos en formato PDF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-4 md:p-8 border-2 border-dashed rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-center">Reporte Estadístico de Matrículas</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Este reporte incluye un resumen general, matrículas por carrera, por municipio, y más.
            </p>
            {isLoading || !stats ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando datos...
              </Button>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                <Button
                  variant="outline"
                  onClick={handlePreviewClick}
                  disabled={isMobile && pdfInstance.loading}
                >
                  {isMobile && pdfInstance.loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  {isMobile
                    ? (pdfInstance.loading ? 'Generando...' : 'Abrir Previsualización')
                    : (showPreview ? 'Ocultar Previsualización' : 'Ver Previsualización')
                  }
                </Button>
                
                <PDFDownloadLink
                  document={pdfDocument} // Usar la misma variable para consistencia
                  fileName={`Reporte_Estadistico_CETA_Jalapa_${new Date().toLocaleDateString()}.pdf`}
                >
                  {({ loading }) => (
                    <Button disabled={loading} className="w-full">
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      {loading ? 'Generando PDF...' : 'Descargar Reporte'}
                    </Button>
                  )}
                </PDFDownloadLink>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showPreview && !isMobile && !isLoading && stats && (
        <div className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Previsualización del Reporte</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowPreview(false)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Cerrar previsualización</span>
              </Button>
            </CardHeader>
            <CardContent>
                <div className="h-[80vh] w-full">
                  <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                    <StatisticalReportPDF stats={stats} />
                  </PDFViewer>
                </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}