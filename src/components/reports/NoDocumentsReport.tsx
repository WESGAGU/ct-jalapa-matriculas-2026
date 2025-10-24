// src/components/reports/NoDocumentsReport.tsx

import React from 'react';
// --- CORRECCIÓN 1: Se corrigió el nombre del paquete ---
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
  summaryBox: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  careerHeader: {
    backgroundColor: '#34495e',
    color: 'white',
    padding: 6,
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
    borderRadius: 3,
  },
  section: {
    marginBottom: 15,
  },
  table: { 
    width: "auto", 
  },
  tableRow: { 
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  tableHeaderRow: { 
    flexDirection: "row", 
    backgroundColor: '#e0e0e0',
  },
  tableCol: { 
    borderStyle: "solid", 
    borderWidth: 1, 
    borderColor: '#bfbfbf', 
    borderLeftWidth: 0, 
    borderTopWidth: 0, 
    padding: 3,
    borderBottomWidth: 0,
    borderRightWidth: 0,
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


type StudentData = Register;

interface NoDocumentsReportProps {
  data: {
    careerName: string;
    shift: string;
    students: StudentData[];
  }[];
}

export const NoDocumentsReportPDF: React.FC<NoDocumentsReportProps> = ({ data }) => {
  const totalStudents = data.reduce((sum, group) => sum + group.students.length, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.header} fixed>
             {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={styles.logo} src="/logo-inatec-2016.png" />
          <View style={styles.headerText}>
            <Text style={styles.title}>Reporte de Estudiantes sin Documentos</Text>
            <Text style={styles.subtitle}>Generado el: {new Date().toLocaleDateString('es-NI')}</Text>
          </View>
        </View>

        <View style={styles.summaryBox} fixed>
          <Text style={styles.summaryText}>Total de Estudiantes sin Documentos:</Text>
          <Text style={styles.summaryText}>{totalStudents}</Text>
        </View>

        {data.map((careerData) => (
          <View key={careerData.careerName} style={styles.section} wrap={false}>
            <Text style={styles.careerHeader}>
              {careerData.careerName} - Turno {careerData.shift}
            </Text>
            <View style={styles.table}>
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
              
              {careerData.students.map((student, index) => (
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
          </View>
        ))}
        
        {data.length === 0 && (
          <View style={styles.section}>
            <Text style={{ textAlign: 'center', fontSize: 12, marginTop: 20 }}>
              ¡Excelente! No se encontraron estudiantes sin documentos registrados.
            </Text>
          </View>
        )}

        {/* --- CORRECCIÓN 2: Se añadieron los tipos explícitos --- */}
        <Text style={styles.footer} fixed render={({ pageNumber, totalPages }: { pageNumber: number, totalPages: number }) => `Página ${pageNumber} de ${totalPages}`} />
      </Page>
    </Document>
  );
};