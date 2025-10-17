// src/components/reports/DetailedCareerReport.tsx

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { Register } from '@/lib/types';

// Registrar fuentes
Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
});

const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    fontFamily: 'Helvetica', 
    fontSize: 6.5,
    color: '#333' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottom: '2px solid #e0e0e0', 
    paddingBottom: 10, 
    marginBottom: 15 
  },
  logo: { width: 80 },
  headerText: { textAlign: 'right' },
  title: { fontSize: 16, fontFamily: 'Oswald', color: '#2c3e50' },
  subtitle: { fontSize: 10, color: '#7f8c8d' },
  
  careerTitle: { 
    fontSize: 14, 
    fontFamily: 'Oswald', 
    color: '#34495e', 
    marginBottom: 10, 
    textAlign: 'center'
  },

  table: { 
    display: "flex", 
    width: "auto", 
    borderStyle: "solid", 
    borderWidth: 1, 
    borderColor: '#bfbfbf', 
    borderRightWidth: 0, 
    borderBottomWidth: 0 
  },
  tableRow: { flexDirection: "row" },
  tableHeaderRow: { 
    flexDirection: "row", 
    backgroundColor: '#e0e0e0',
    minPresenceAhead: 15 // <-- SOLUCIÓN AL ENCABEZADO FANTASMA
  },
  tableCol: { 
    borderStyle: "solid", 
    borderWidth: 1, 
    borderColor: '#bfbfbf', 
    borderLeftWidth: 0, 
    borderTopWidth: 0, 
    padding: 3 
  },
  tableCellHeader: { 
    fontSize: 6.8,
    fontWeight: 'bold', 
    fontFamily: 'Helvetica-Bold'
  },
  tableCell: { 
    fontSize: 6.2
  },

  footer: { 
    position: 'absolute', 
    bottom: 20, 
    left: 30, 
    right: 30, 
    textAlign: 'center', 
    color: 'grey', 
    fontSize: 8 
  },
});

interface DetailedCareerReportPDFProps {
  enrollments: Register[];
  careerName: string;
  careerShift: string; // <-- Prop para el turno
}

export const DetailedCareerReportPDF: React.FC<DetailedCareerReportPDFProps> = ({ enrollments, careerName, careerShift }) => (
  <Document>
    <Page size="A4" style={styles.page} orientation="landscape">
      <View style={styles.header} fixed>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.logo} src="/logo-inatec-2016.png" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Listado Detallado de Estudiantes</Text>
          <Text style={styles.subtitle}>Generado el: {new Date().toLocaleDateString('es-NI')}</Text>
        </View>
      </View>

      {/* Título actualizado para incluir el turno */}
      <Text style={styles.careerTitle}>{careerName} - Turno {careerShift} ({enrollments.length} Estudiantes)</Text>

      <View style={styles.table}>
        {/* Encabezados de la tabla */}
        <View style={styles.tableHeaderRow} fixed>
            <View style={[styles.tableCol, { width: '3%' }]}><Text style={styles.tableCellHeader}>N°</Text></View>
            <View style={[styles.tableCol, { width: '9%' }]}><Text style={styles.tableCellHeader}>Nombres</Text></View>
            <View style={[styles.tableCol, { width: '9%' }]}><Text style={styles.tableCellHeader}>Apellidos</Text></View>
            <View style={[styles.tableCol, { width: '7%' }]}><Text style={styles.tableCellHeader}>Cédula</Text></View>
            <View style={[styles.tableCol, { width: '6%' }]}><Text style={styles.tableCellHeader}>Teléfono</Text></View>
            <View style={[styles.tableCol, { width: '6%' }]}><Text style={styles.tableCellHeader}>Fec. Nac.</Text></View>
            <View style={[styles.tableCol, { width: '8%' }]}><Text style={styles.tableCellHeader}>Municipio</Text></View>
            <View style={[styles.tableCol, { width: '9%' }]}><Text style={styles.tableCellHeader}>Comunidad</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCellHeader}>Dirección</Text></View>
            <View style={[styles.tableCol, { width: '8%' }]}><Text style={styles.tableCellHeader}>Nivel Académico</Text></View>
            <View style={[styles.tableCol, { width: '12%' }]}><Text style={styles.tableCellHeader}>Nombre Emergencia</Text></View>
            <View style={[styles.tableCol, { width: '8%' }]}><Text style={styles.tableCellHeader}>Contacto Emerg.</Text></View>
        </View>
        
        {/* Contenido de la tabla */}
        {enrollments.map((student, index) => (
          <View key={student.id} style={styles.tableRow} wrap={false}>
            <View style={[styles.tableCol, { width: '3%' }]}><Text style={styles.tableCell}>{index + 1}</Text></View>
            <View style={[styles.tableCol, { width: '9%' }]}><Text style={styles.tableCell}>{student.nombres}</Text></View>
            <View style={[styles.tableCol, { width: '9%' }]}><Text style={styles.tableCell}>{student.apellidos}</Text></View>
            <View style={[styles.tableCol, { width: '7%' }]}><Text style={styles.tableCell}>{student.cedula || 'N/A'}</Text></View>
            <View style={[styles.tableCol, { width: '6%' }]}><Text style={styles.tableCell}>{student.telefonoCelular}</Text></View>
            <View style={[styles.tableCol, { width: '6%' }]}><Text style={styles.tableCell}>{new Date(student.birthDate).toLocaleDateString('es-NI')}</Text></View>
            <View style={[styles.tableCol, { width: '8%' }]}><Text style={styles.tableCell}>{student.municipioDomiciliar}</Text></View>
            <View style={[styles.tableCol, { width: '9%' }]}><Text style={styles.tableCell}>{student.comunidad}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{student.direccion}</Text></View>
            <View style={[styles.tableCol, { width: '8%' }]}><Text style={styles.tableCell}>{student.nivelAcademico}</Text></View>
            <View style={[styles.tableCol, { width: '12%' }]}><Text style={styles.tableCell}>{student.nombreEmergencia}</Text></View>
            <View style={[styles.tableCol, { width: '8%' }]}><Text style={styles.tableCell}>{student.telefonoEmergencia}</Text></View>
          </View>
        ))}
      </View>

      <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
    </Page>
  </Document>
);