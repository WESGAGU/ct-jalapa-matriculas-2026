import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { getEnrollmentStats } from '@/lib/actions';

// Registrar fuentes
Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

// Estilos Optimizados y Corregidos
const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#333333',
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
  headerInfo: {
    textAlign: 'right',
  },
  logo: {
    width: 80,
    height: 'auto',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Oswald',
    color: '#1a237e',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 10,
    color: '#555',
  },
  section: {
    marginBottom: 15,
  },
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
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  gridItem: {
    width: '48%',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  summaryBox: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#555',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1a237e',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottom: '1px solid #eee',
  },
  itemName: {
    fontSize: 9,
  },
  itemValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableColHeader: {
    backgroundColor: '#f2f2f2',
    padding: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCol: {
    padding: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  tableCell: {
    fontSize: 8,
  },
  communityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  communityText: {
    fontSize: 8,
  },
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
        <View style={styles.header} fixed>
           {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={styles.logo} src="/logo-inatec-2016.png" />
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Reporte Estadístico de Matrículas</Text>
            <Text style={styles.subtitle}>Generado el: {date.toLocaleDateString('es-NI')}</Text>
          </View>
        </View>

        <View style={styles.summaryGrid} wrap={false}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total de Matrículas</Text>
            <Text style={styles.summaryValue}>{stats.totalEnrollments}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Matrículas de este Mes</Text>
            <Text style={styles.summaryValue}>{stats.monthlyTotal}</Text>
          </View>
        </View>

        {hasMonthlyData && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Historial de Matrículas Mensuales</Text>
            <View style={styles.table}>
              <View style={styles.tableRow} fixed>
                <View style={[styles.tableColHeader, { width: '50%' }]}><Text style={styles.tableCellHeader}>Mes</Text></View>
                <View style={[styles.tableColHeader, { width: '50%', textAlign: 'center' }]}><Text style={styles.tableCellHeader}>Total de Matrículas</Text></View>
              </View>
              {stats.monthlyEnrollments
                .filter(monthData => monthData.total > 0)
                .map((monthData, index) => (
                  <View key={index} style={styles.tableRow} wrap={false}>
                    <View style={[styles.tableCol, { width: '50%' }]}><Text style={styles.tableCell}>{monthData.name}</Text></View>
                    <View style={[styles.tableCol, { width: '50%', textAlign: 'center' }]}><Text style={styles.tableCell}>{monthData.total}</Text></View>
                  </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Matrículas por Carrera</Text>
          <View style={styles.table}>
            <View style={styles.tableRow} fixed>
              <View style={[styles.tableColHeader, { width: '60%' }]}><Text style={styles.tableCellHeader}>Carrera Técnica</Text></View>
              <View style={[styles.tableColHeader, { width: '25%' }]}><Text style={styles.tableCellHeader}>Turno</Text></View>
              <View style={[styles.tableColHeader, { width: '15%', textAlign: 'center' }]}><Text style={styles.tableCellHeader}>Total</Text></View>
            </View>
            {stats.enrollmentsByCareer.map((career, index) => (
              <View key={index} style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCol, { width: '60%' }]}><Text style={styles.tableCell}>{career.name}</Text></View>
                <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{career.shift}</Text></View>
                <View style={[styles.tableCol, { width: '15%', textAlign: 'center' }]}><Text style={styles.tableCell}>{career.total}</Text></View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.gridContainer}>
          <View style={[styles.section, styles.gridItem]} wrap={false}>
            <Text style={styles.sectionTitle}>Distribución por Edades</Text>
            {stats.enrollmentsByAge.map((ageData) => (
              <View key={ageData.age} style={styles.listItem}>
                <Text style={styles.itemName}>Edad de {ageData.age} años:</Text>
                <Text style={styles.itemValue}>{ageData.total}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.section, styles.gridItem]} wrap={false}>
            <Text style={styles.sectionTitle}>Por Nivel Académico</Text>
            {stats.enrollmentsByAcademicLevel.map((level) => (
              <View key={level.name} style={styles.listItem}>
                <Text style={styles.itemName}>{level.name}:</Text>
                <Text style={styles.itemValue}>{level.total}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Procedencia de Estudiantes</Text>
          <View style={styles.table}>
            <View style={styles.tableRow} fixed>
              <View style={[styles.tableColHeader, { width: '40%' }]}><Text style={styles.tableCellHeader}>Municipio</Text></View>
              <View style={[styles.tableColHeader, { width: '45%' }]}><Text style={styles.tableCellHeader}>Comunidad</Text></View>
              <View style={[styles.tableColHeader, { width: '15%', textAlign: 'center' }]}><Text style={styles.tableCellHeader}>Total</Text></View>
            </View>
            {stats.enrollmentsByLocation.map((location) => (
              <View key={location.municipio} style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCol, { width: '40%' }]}>
                  <Text style={styles.tableCell}>{location.municipio}</Text>
                </View>
                <View style={[styles.tableCol, { width: '60%', flexDirection: 'column', padding: 0 }]}>
                  {location.comunidades.map((community, index) => (
                    <View key={index} style={[styles.communityItem, { borderBottomWidth: index === location.comunidades.length - 1 ? 0 : 0.5, borderBottomColor: '#eee', padding: 5}]}>
                      <Text style={[styles.communityText, { width: '80%' }]}>{community.name}</Text>
                      <Text style={[styles.communityText, { width: '20%', textAlign: 'center' }]}>{community.total}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages} - Centro Tecnológico de Jalapa`} />
      </Page>
    </Document>
  );
};