'use client';

import { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer, pdf } from '@react-pdf/renderer'; // Importar 'pdf'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Eye, X } from 'lucide-react';
import { StatisticalReportPDF } from '@/components/reports/StatisticalReport';
import { getEnrollmentStats } from '@/lib/actions';

type StatsData = Awaited<ReturnType<typeof getEnrollmentStats>>;

// Hook mejorado para detectar si es un dispositivo móvil
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Comprueba si 'window' está definido para evitar errores en el servidor (SSR)
    if (typeof window !== "undefined") {
      const checkDevice = () => {
        // Expresión regular para detectar los user agents de móviles más comunes
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        setIsMobile(isMobileDevice);
      };

      checkDevice();
      window.addEventListener('resize', checkDevice);
      
      return () => window.removeEventListener('resize', checkDevice);
    }
  }, []);

  return isMobile;
}


export default function ReportsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false); // Estado para el loader del preview
  const isMobile = useIsMobile();

  useEffect(() => {
    async function loadStats() {
      try {
        const statsData = await getEnrollmentStats();
        setStats(statsData);
      } catch (error) {
        console.error("Error al cargar las estadísticas:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  // Función para manejar el clic en el botón de previsualización
  const handlePreview = async () => {
    if (isMobile) {
      if (!stats) return;
      setIsGeneratingPreview(true);
      try {
        // 1. Genera el PDF como un Blob
        const blob = await pdf(<StatisticalReportPDF stats={stats} />).toBlob();
        // 2. Crea una URL para el Blob
        const url = URL.createObjectURL(blob);
        // 3. Abre la URL en una nueva pestaña
        window.open(url, '_blank');
        // Opcional: revocar la URL después de un tiempo para liberar memoria
        setTimeout(() => URL.revokeObjectURL(url), 1000); 
      } catch (error) {
        console.error("Error al generar o abrir el PDF:", error);
      } finally {
        setIsGeneratingPreview(false);
      }
    } else {
      // En escritorio, solo muestra u oculta el visor
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
                <Button variant="outline" onClick={handlePreview} disabled={isGeneratingPreview}>
                  {isGeneratingPreview ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  {showPreview ? 'Ocultar Previsualización' : 'Ver Previsualización'}
                </Button>
                
                <PDFDownloadLink
                  document={<StatisticalReportPDF stats={stats} />}
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

      {/* El visor solo se renderiza en escritorio y si showPreview es true */}
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
                <div className="h-[60vh] md:h-[80vh] w-full">
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