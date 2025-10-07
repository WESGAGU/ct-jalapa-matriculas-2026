'use client';

import { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Eye } from 'lucide-react';
import { StatisticalReportPDF } from '@/components/reports/StatisticalReport';
import { getEnrollmentStats } from '@/lib/actions';

type StatsData = Awaited<ReturnType<typeof getEnrollmentStats>>;

export default function ReportsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

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
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Reporte Estadístico de Matrículas</h2>
            <p className="text-muted-foreground mb-6 text-center">
              Este reporte incluye un resumen general, matrículas por carrera, por municipio, y más.
            </p>
            {isLoading || !stats ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando datos...
              </Button>
            ) : (
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                  <Eye className="mr-2 h-4 w-4" />
                  {showPreview ? 'Ocultar Previsualización' : 'Ver Previsualización'}
                </Button>
                
                <PDFDownloadLink
                  document={<StatisticalReportPDF stats={stats} />}
                  fileName={`Reporte_Estadistico_CETA_Jalapa_${new Date().toLocaleDateString()}.pdf`}
                >
                  {({ loading }) => (
                    <Button disabled={loading}>
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

      {showPreview && !isLoading && stats && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Previsualización del Reporte</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ height: '80vh', width: '100%' }}>
                  <PDFViewer width="100%" height="100%">
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