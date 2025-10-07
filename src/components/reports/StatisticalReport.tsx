// src/components/dashboard/StatisticalReport.tsx
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { getEnrollmentStats } from '@/lib/actions';

// Registrar fuentes (opcional, pero recomendado para mejor apariencia)
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
  // --- ESTILOS DEL ENCABEZADO MODIFICADOS ---
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
    marginBottom: 10, // Espacio entre logos y texto
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
  // --- FIN DE ESTILOS DEL ENCABEZADO ---
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
  // Estilos para la nueva tabla de matrículas mensuales
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
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#bfbfbf',
    backgroundColor: '#e0e0e0',
    padding: 5,
  },
  tableCol: {
    width: "50%",
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

export const StatisticalReportPDF: React.FC<StatisticalReportPDFProps> = ({ stats }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Encabezado con nueva estructura */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={styles.logo} src="/pdf-logo-izquierda.jpg" />
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={styles.logo} src="/pdf-logo-derecha.jpg" />
        </View>
        <View >
          <Text style={styles.title}>Reporte Estadístico de Matrículas</Text>
          <Text style={styles.subtitle}>Generado el: {new Date().toLocaleDateString('es-NI')}</Text>
        </View>
      </View>

      {/* Resumen General */}
      <View style={styles.section}>
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

      {/* Nueva Sección: Historial de Matrículas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial de Matrículas (Últimos 12 Meses)</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Mes</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Total de Matrículas</Text></View>
          </View>
          {stats.monthlyEnrollments.map((monthData, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{monthData.name}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{monthData.total}</Text></View>
            </View>
          ))}
        </View>
      </View>

      {/* Secciones existentes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Matrículas por Carrera</Text>
        {stats.enrollmentsByCareer.map((career) => (
          <View key={`${career.name}-${career.shift}`} style={styles.listItem}>
            <Text style={styles.itemName}>{career.name} ({career.shift})</Text>
            <Text style={styles.itemValue}>{career.total}</Text>
          </View>
        ))}
      </View>

      <View style={styles.gridContainer}>
        <View style={[styles.section, {width: '48%'}]}>
          <Text style={styles.sectionTitle}>Distribución por Edades</Text>
          {stats.enrollmentsByAgeRange.map((range) => (
            <View key={range.name} style={styles.listItem}>
              <Text style={styles.itemName}>Rango de {range.name} años:</Text>
              <Text style={styles.itemValue}>{range.total}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, {width: '48%'}]}>
          <Text style={styles.sectionTitle}>Por Nivel Académico</Text>
          {stats.enrollmentsByAcademicLevel.map((level) => (
            <View key={level.name} style={styles.listItem}>
              <Text style={styles.itemName}>{level.name}:</Text>
              <Text style={styles.itemValue}>{level.total}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
          <Text style={styles.sectionTitle}>Por Municipio</Text>
          {stats.enrollmentsByMunicipality.map((municipality) => (
            <View key={municipality.name} style={styles.listItem}>
              <Text style={styles.itemName}>{municipality.name}:</Text>
              <Text style={styles.itemValue}>{municipality.total}</Text>
            </View>
          ))}
      </View>

      <Text style={styles.footer}>
        Centro Tecnológico de Jalapa - Sistema de Matrículas
      </Text>
    </Page>
  </Document>
);