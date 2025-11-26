import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { getEnrollmentStats } from '@/lib/actions';

Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  headerInfo: { textAlign: 'right' },
  logo: { width: 80, height: 'auto' },
  title: {
    fontSize: 18,
    fontFamily: 'Oswald',
    color: '#1a237e',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  subtitle: { fontSize: 10, color: '#555' },
  section: { marginBottom: 15 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    color: '#3f51b5',
    borderBottomWidth: 1,
    borderBottomColor: '#9fa8da',
    paddingBottom: 3,
    textTransform: 'uppercase',
  },
  
  // Grids de Resumen
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f5f5f5',
    padding: 8, // Reducido padding
    borderRadius: 5,
    marginBottom: 15,
  },
  summaryBox: { alignItems: 'center' },
  summaryLabel: { fontSize: 9, color: '#555' },
  summaryValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#1a237e' },

  // Listas simples
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  gridItem: { width: '48%' },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3, // Reducido para quitar espacio
    borderBottom: '1px solid #eee',
  },
  itemName: { fontSize: 9 },
  itemValue: { fontSize: 9, fontWeight: 'bold' },

  // --- ESTILOS DE TABLA GENÉRICA ---
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    minHeight: 18, // Altura mínima controlada
    alignItems: 'center',
  },
  tableColHeader: {
    backgroundColor: '#f2f2f2',
    padding: 4,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCol: {
    padding: 4,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  tableCell: { fontSize: 8 },

  // --- ESTILOS ESPECÍFICOS: TABLA PROCEDENCIA (FIXED) ---
  // Estos estilos simulan la celda fusionada renderizando fila por fila
  
  procRow: {
    flexDirection: 'row',
    borderBottomWidth: 0, // El borde lo manejan las celdas
    minHeight: 16, // Altura compacta
    alignItems: 'stretch', // Estirar para que los bordes verticales conecten
  },
  
  // Celda Municipio (Izquierda)
  cellMunicipio: {
    width: '30%',
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
    justifyContent: 'center',
  },
  textMunicipio: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1a237e',
    textTransform: 'uppercase',
    textAlign: 'center', // Centrado horizontal
  },
  
  // Celda Comunidad (Centro)
  cellComunidad: {
    width: '56%',
    padding: 4,
    paddingLeft: 8,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  textComunidad: { fontSize: 8, color: '#444' },

  // Celda Total (Derecha)
  cellTotal: {
    width: '14%',
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textTotal: { fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#999',
    fontSize: 8,
  },
});

interface StatisticalReportPDFProps {
  stats: Awaited<ReturnType<typeof getEnrollmentStats>>;
}

export const StatisticalReportPDF: React.FC<StatisticalReportPDFProps> = ({ stats }) => {
  const hasMonthlyData = stats.monthlyEnrollments.some(month => month.total > 0);
  const date = new Date();

  return (
    <Document author="Centro Tecnológico de Jalapa" title={`Reporte Estadístico - ${date.toLocaleDateString()}`}>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header} fixed>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={styles.logo} src="/logo-inatec-2016.png" />
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Reporte Estadístico de Matrículas</Text>
            <Text style={styles.subtitle}>Generado el: {date.toLocaleDateString('es-NI')}</Text>
          </View>
        </View>

        {/* Resumen */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total de Matrículas</Text>
            <Text style={styles.summaryValue}>{stats.totalEnrollments}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Matrículas de este Mes</Text>
            <Text style={styles.summaryValue}>{stats.monthlyTotal}</Text>
          </View>
        </View>

        {/* Tabla Mensual */}
        {hasMonthlyData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historial Mensual</Text>
            <View style={styles.table}>
              <View style={styles.tableRow} fixed>
                <View style={[styles.tableColHeader, { width: '50%' }]}><Text style={styles.tableCellHeader}>Mes</Text></View>
                <View style={[styles.tableColHeader, { width: '50%' }]}><Text style={[styles.tableCellHeader, { textAlign: 'center' }]}>Total</Text></View>
              </View>
              {stats.monthlyEnrollments.filter(m => m.total > 0).map((m, i) => (
                <View key={i} style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '50%' }]}><Text style={styles.tableCell}>{m.name}</Text></View>
                  <View style={[styles.tableCol, { width: '50%' }]}><Text style={[styles.tableCell, { textAlign: 'center' }]}>{m.total}</Text></View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tabla Carreras */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Por Carrera Técnica</Text>
          <View style={styles.table}>
            <View style={styles.tableRow} fixed>
              <View style={[styles.tableColHeader, { width: '60%' }]}><Text style={styles.tableCellHeader}>Carrera</Text></View>
              <View style={[styles.tableColHeader, { width: '25%' }]}><Text style={styles.tableCellHeader}>Turno</Text></View>
              <View style={[styles.tableColHeader, { width: '15%' }]}><Text style={[styles.tableCellHeader, { textAlign: 'center' }]}>Total</Text></View>
            </View>
            {stats.enrollmentsByCareer.map((c, i) => (
              <View key={i} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '60%' }]}><Text style={styles.tableCell}>{c.name}</Text></View>
                <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{c.shift}</Text></View>
                <View style={[styles.tableCol, { width: '15%' }]}><Text style={[styles.tableCell, { textAlign: 'center' }]}>{c.total}</Text></View>
              </View>
            ))}
          </View>
        </View>

        {/* Grids Edades / Niveles */}
        <View style={styles.gridContainer}>
          <View style={[styles.section, styles.gridItem]}>
            <Text style={styles.sectionTitle}>Edades</Text>
            {stats.enrollmentsByAge.map((a) => (
              <View key={a.age} style={styles.listItem}>
                <Text style={styles.itemName}>{a.age} años:</Text>
                <Text style={styles.itemValue}>{a.total}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.section, styles.gridItem]}>
            <Text style={styles.sectionTitle}>Nivel Académico</Text>
            {stats.enrollmentsByAcademicLevel.map((l) => (
              <View key={l.name} style={styles.listItem}>
                <Text style={styles.itemName}>{l.name}:</Text>
                <Text style={styles.itemValue}>{l.total}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* --- TABLA DE PROCEDENCIA (LÓGICA CORREGIDA) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Procedencia de Estudiantes</Text>
          
          {/* Header de la Tabla */}
          <View style={{ flexDirection: 'row', backgroundColor: '#f2f2f2', borderTopWidth: 1, borderTopColor: '#e0e0e0', borderLeftWidth: 1, borderLeftColor: '#e0e0e0', borderRightWidth: 1, borderRightColor: '#e0e0e0' }} fixed>
            <View style={{ width: '30%', padding: 4, borderRightWidth: 1, borderRightColor: '#e0e0e0', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
              <Text style={styles.tableCellHeader}>Municipio</Text>
            </View>
            <View style={{ width: '56%', padding: 4, borderRightWidth: 1, borderRightColor: '#e0e0e0', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
              <Text style={styles.tableCellHeader}>Comunidad</Text>
            </View>
            <View style={{ width: '14%', padding: 4, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' }}>
              <Text style={[styles.tableCellHeader, { textAlign: 'center' }]}>Total</Text>
            </View>
          </View>

          {/* Cuerpo de la Tabla */}
          <View style={{ borderTopWidth: 0 }}>
            {stats.enrollmentsByLocation.map((location) => (
              // Mapeamos las comunidades directamente para permitir saltos de página
              location.comunidades.map((community, index) => {
                const isFirst = index === 0;
                const isLast = index === location.comunidades.length - 1;

                return (
                  <View key={`${location.municipio}-${index}`} style={styles.procRow}>
                    
                    {/* Celda Municipio: Solo tiene texto si es la primera. Tiene borde inferior solo si es la última */}
                    <View style={[
                      styles.cellMunicipio, 
                      { borderBottomWidth: isLast ? 1 : 0, borderBottomColor: '#e0e0e0', backgroundColor: isFirst ? '#fcfcfc' : 'transparent' }
                    ]}>
                      {isFirst && (
                        <Text style={styles.textMunicipio}>{location.municipio}</Text>
                      )}
                    </View>

                    {/* Celda Comunidad */}
                    <View style={styles.cellComunidad}>
                      <Text style={styles.textComunidad}>{community.name}</Text>
                    </View>

                    {/* Celda Total */}
                    <View style={styles.cellTotal}>
                      <Text style={styles.textTotal}>{community.total}</Text>
                    </View>
                  </View>
                );
              })
            ))}
          </View>
        </View>

        <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages} - Centro Tecnológico de Jalapa`} />
      </Page>
    </Document>
  );
};