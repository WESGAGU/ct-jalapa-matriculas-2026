import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { getEnrollmentStats } from '@/lib/actions';

// Registrar fuentes
Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#333'
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: '2px solid #e0e0e0',
    paddingBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  logo: {
    width: 90,
    height: 'auto',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Oswald',
    color: '#2c3e50',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#34495e',
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
    paddingBottom: 5,
    textTransform: 'uppercase',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 10,
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
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#bfbfbf',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: '#ffffff'
  },
  tableColHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#bfbfbf',
    backgroundColor: '#e0e0e0',
    padding: 5,
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#bfbfbf',
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold'
  },
  tableCell: {
    fontSize: 9
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: 'grey',
    fontSize: 8,
  },
});

interface StatisticalReportPDFProps {
  stats: Awaited<ReturnType<typeof getEnrollmentStats>>;
}

export const StatisticalReportPDF: React.FC<StatisticalReportPDFProps> = ({ stats }) => {

  const hasMonthlyData = stats.monthlyEnrollments.some(month => month.total > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header} fixed>
          <View style={styles.logoContainer}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={styles.logo} src="/pdf-logo-izquierda.jpg" />
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={styles.logo} src="/pdf-logo-derecha.jpg" />
          </View>
          <View>
            <Text style={styles.title}>Reporte Estadístico de Matrículas</Text>
            <Text style={styles.subtitle}>Generado el: {new Date().toLocaleDateString('es-NI')}</Text>
          </View>
        </View>

        {/* Resumen General */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Resumen General</Text>
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <Text style={styles.itemName}>Total de Matrículas:</Text>
              <Text style={styles.itemValue}>{stats.totalEnrollments}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.itemName}>Matrículas de este Mes:</Text>
              <Text style={styles.itemValue}>{stats.monthlyTotal}</Text>
            </View>
          </View>
        </View>

        {/* Historial de Matrículas */}
        {hasMonthlyData && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Historial de Matrículas (Meses con Actividad)</Text>
            <View style={styles.table}>
              <View style={styles.tableRow} fixed>
                <View style={[styles.tableColHeader, { width: '50%' }]}><Text style={styles.tableCellHeader}>Mes</Text></View>
                <View style={[styles.tableColHeader, { width: '50%' }]}><Text style={styles.tableCellHeader}>Total de Matrículas</Text></View>
              </View>
              {stats.monthlyEnrollments
                .filter(monthData => monthData.total > 0)
                .map((monthData, index) => (
                  <View key={index} style={styles.tableRow}>
                    <View style={[styles.tableCol, { width: '50%' }]}><Text style={styles.tableCell}>{monthData.name}</Text></View>
                    <View style={[styles.tableCol, { width: '50%' }]}><Text style={styles.tableCell}>{monthData.total}</Text></View>
                  </View>
              ))}
            </View>
          </View>
        )}

        {/* Matrículas por Carrera como tabla */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Matrículas por Carrera</Text>
          <View style={styles.table}>
            <View style={styles.tableRow} fixed>
              <View style={[styles.tableColHeader, { width: '60%' }]}><Text style={styles.tableCellHeader}>Carrera Técnica</Text></View>
              <View style={[styles.tableColHeader, { width: '25%' }]}><Text style={styles.tableCellHeader}>Turno</Text></View>
              <View style={[styles.tableColHeader, { width: '15%', textAlign: 'center' }]}><Text style={styles.tableCellHeader}>Total</Text></View>
            </View>
            {stats.enrollmentsByCareer.map((career, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: '60%' }]}><Text style={styles.tableCell}>{career.name}</Text></View>
                <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{career.shift}</Text></View>
                <View style={[styles.tableCol, { width: '15%', textAlign: 'center' }]}><Text style={styles.tableCell}>{career.total}</Text></View>
              </View>
            ))}
          </View>
        </View>

        {/* Contenedor para Edades y Nivel Académico */}
        <View style={styles.gridContainer}>
          <View style={[styles.section, {width: '48%'}]} wrap={false}>
            <Text style={styles.sectionTitle}>Distribución por Edades</Text>
            {stats.enrollmentsByAge.map((ageData) => (
              <View key={ageData.age} style={styles.listItem}>
                <Text style={styles.itemName}>Edad de {ageData.age} años:</Text>
                <Text style={styles.itemValue}>{ageData.total}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.section, {width: '48%'}]} wrap={false}>
            <Text style={styles.sectionTitle}>Por Nivel Académico</Text>
            {stats.enrollmentsByAcademicLevel.map((level) => (
              <View key={level.name} style={styles.listItem}>
                <Text style={styles.itemName}>{level.name}:</Text>
                <Text style={styles.itemValue}>{level.total}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Tabla de Procedencia de Estudiantes */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Procedencia de Estudiantes</Text>
          <View style={styles.table}>
            {/* Encabezados de la tabla */}
            <View style={styles.tableRow} fixed>
              <View style={[styles.tableColHeader, { width: '40%' }]}><Text style={styles.tableCellHeader}>Municipio</Text></View>
              <View style={[styles.tableColHeader, { width: '45%' }]}><Text style={styles.tableCellHeader}>Comunidad</Text></View>
              <View style={[styles.tableColHeader, { width: '15%', textAlign: 'center' }]}><Text style={styles.tableCellHeader}>Total</Text></View>
            </View>
            {/* Contenido de la tabla */}
            {stats.enrollmentsByLocation.flatMap((location) =>
              location.comunidades.map((community, index) => (
                <View key={`${location.municipio}-${community.name}-${index}`} style={styles.tableRow}>
                  <View style={[styles.tableCol, { width: '40%' }]}><Text style={styles.tableCell}>{location.municipio}</Text></View>
                  <View style={[styles.tableCol, { width: '45%' }]}><Text style={styles.tableCell}>{community.name}</Text></View>
                  <View style={[styles.tableCol, { width: '15%', textAlign: 'center' }]}><Text style={styles.tableCell}>{community.total}</Text></View>
                </View>
              ))
            )}
          </View>
        </View>

        <Text style={styles.footer} fixed>
          Centro Tecnológico de Jalapa - Sistema de Matrículas
        </Text>
      </Page>
    </Document>
  );
};