import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { Register } from '@/lib/types';
import { Register as PrismaRegister } from '@prisma/client';

const styles = StyleSheet.create({
  page: { padding: 20, fontFamily: 'Helvetica', fontSize: 9, color: '#333' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  logoLeft: { width: 110, height: 30 },
  logoRight: { width: 60, height: 40 },
  centerContent: { flex: 1, alignItems: 'center', marginHorizontal: 10 },
  title: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 },
  subtitle: { fontSize: 12, fontWeight: 'bold' },
  
  topInfoContainer: {
    marginBottom: 15,
  },
  
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'flex-end',
  },
  
  infoLabel: {
    fontWeight: 'bold',
    width: 110,
    fontSize: 9,
  },
  infoLabel2: {
    fontSize: 9,
    position: 'relative',
    left: 250,
    fontWeight: 'bold'
  },
  
  infoValue: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    paddingBottom: 1,
    fontSize: 9,
    marginRight: 10,
  },
  
  secondInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  
  dateEmailContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '65%',
  },
  
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    fontSize: 10,
  },
  infoColumn: { width: '65%' },
  section: {padding: 5 },
  sectionTitle: {padding: 4, fontSize: 10, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  grid: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'row', alignItems: 'flex-end', width: '50%', paddingRight: 10, marginBottom: 6 },
  fieldFull: { width: '100%' },
  label: { fontSize: 8, fontWeight: 'bold', width: 140 },
  value: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#666', paddingBottom: 2 },
  
  // --- INICIO DE LA CORRECCIÓN DE ESTILOS ---
  footer: { 
    position: 'absolute', 
    bottom: 40, 
    left: 40, 
    right: 40, 
    display: 'flex', 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    paddingTop: 30, 
    textAlign: 'center', 
    fontSize: 10 
  },
  
  signatureContainer: {
    width: 220, // Ancho del contenedor de firma
    position: 'relative', // Necesario para posicionar la imagen de firma
    alignItems: 'center', // Centra la línea de firma
  },
  
  signatureLine: { 
    borderTopWidth: 1, 
    borderTopColor: '#333', 
    paddingTop: 5, 
    width: 200 // Ancho de la línea
  },

  firmaImage: {
    position: 'absolute',
    width: 150,      // Ajusta el ancho de la firma
    height: 60,      // Ajusta la altura
    top: -40,        // Sube la imagen para que quede sobre la línea
    objectFit: 'contain', // Asegura que la imagen escale correctamente
  },
  // --- FIN DE LA CORRECCIÓN DE ESTILOS ---

  imagePage: {
    padding: 40,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  image: {
    maxWidth: '90%',
    maxHeight: '45%',
    marginBottom: 20,
    border: '1px solid #ccc',
  },
  ImageNotasDiplomaNacimiento: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
});

// Componente Field
const Field = ({ label, value, fullWidth = false }: { label: string; value: string | number | null | undefined; fullWidth?: boolean }) => (
  <View style={fullWidth ? [styles.field, styles.fieldFull] : styles.field}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || ' '}</Text>
  </View>
);

interface EnrollmentPDFProps {
  enrollment: Register | PrismaRegister;
}

export const EnrollmentPDF = ({ enrollment }: EnrollmentPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Encabezado con logos */}
      <View style={styles.header}>
        <Image
          style={styles.logoLeft}
          src="/pdf-logo-izquierda.jpg"
        />
        <View style={styles.centerContent}>
          <Text style={styles.title}>HOJA DE MATRÍCULA 2026</Text>
        </View>
        <Image
          style={styles.logoRight}
          src="/pdf-logo-derecha.jpg"
        />
      </View>

      {/* Información de centro y fecha */}
      <View style={styles.topInfoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>CENTRO:</Text>
          <Text style={styles.infoValue}>CENTRO TECNOLÓGICO DE JALAPA</Text>
        </View>
        
        <View style={styles.secondInfoRow}>
          <View style={styles.dateEmailContainer}>
            <Text style={styles.infoLabel}>FECHA:</Text>
            <Text style={styles.infoValue}>{new Date(enrollment.createdAt).toLocaleDateString('es-NI')}</Text>
            <Text style={styles.infoLabel}>CORREO ELECTRÓNICO:</Text>
          </View>
        </View>
        <View>
            <Text style={styles.infoLabel2}>CONTRASEÑA TEMPORAL:</Text>
          </View>
      </View>

      {/* --- Secciones de datos (sin cambios) --- */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>I. DATOS PERSONALES DEL PARTICIPANTE</Text>
            <View style={styles.grid}>
                <Field label="NACIONALIDAD" value="Nicaragüense" />
                <Field label="CÉDULA" value={enrollment.cedula} />
                <Field label="FECHA DE NACIMIENTO" value={new Date(enrollment.birthDate).toLocaleDateString('es-NI')} />
                <Field label="CARNET" value="" />
                <Field label="PRIMER NOMBRE" value={enrollment.nombres?.split(' ')[0] || ''} />
                <Field label="SEGUNDO NOMBRE" value={enrollment.nombres?.split(' ').slice(1).join(' ') || ''} />
                <Field label="PRIMER APELLIDO" value={enrollment.apellidos?.split(' ')[0] || ''} />
                <Field label="SEGUNDO APELLIDO" value={enrollment.apellidos?.split(' ').slice(1).join(' ') || ''} />
                <Field label="SEXO" value={enrollment.gender} />
                <Field label="ESTADO CIVIL" value={enrollment.estadoCivil} />
                <Field label="MUN. DE NACIMIENTO" value={enrollment.municipioNacimiento} />
                <Field label="MUNICIPIO DOMICILIAR" value={enrollment.municipioDomiciliar} />
                <Field label="DEPARTAMENTO DOMICILIAR" value={enrollment.deptoDomiciliar} />
                <Field label="No. DE PERSONAS EN EL HOGAR" value={enrollment.numPersonasHogar} />
                <Field label="COMUNIDAD" value={enrollment.comunidad} />
                <Field label="PROFESIÓN" value="" />
                <Field label="DIRECCIÓN DOMICILIAR" value={enrollment.direccion} fullWidth />
                <Field label="TELÉFONO CELULAR" value={enrollment.telefonoCelular} />
                <Field label="TELÉFONO DOMICILIAR" value="" />
                <Field label="EMAIL" value={enrollment.email} />
                <Field label="ÁREA" value="" />
                <Field label="NIVEL ACADÉMICO" value={enrollment.nivelAcademico} />
                <Field label="IDIOMA" value="Español" />
            </View>
        </View>
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>II. DATOS LABORALES DEL PROTAGONISTA</Text>
            <View style={styles.grid}>
                <Field label="NOMBRE DE LA EMPRESA O EMPRENDIMIENTO" value="" />
                <Field label="DIRECCIÓN" value="" />
                <Field label="DEPARTAMENTO" value="" />
                <Field label="MUNICIPIO" value="" />
                <Field label="TELÉFONO" value="" />
                <Field label="CARGO" value="" />
            </View>
        </View>
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>III. EN CASO DE EMERGENCIA NOTIFICAR A</Text>
            <View style={styles.grid}>
                <Field label="NOMBRE DE LA PERSONA" value={enrollment.nombreEmergencia} />
                <Field label="PARENTESCO" value={enrollment.parentescoEmergencia} />
                <Field label="DIRECCIÓN" value={enrollment.direccionParentesco} />
                <Field label="TELÉFONO" value={enrollment.telefonoEmergencia} />
            </View>
        </View>
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>IV. DATOS DE LA ESPECIALIDAD O CURSO</Text>
            <View style={styles.grid}>
                <Field label="DEPARTAMENTO" value="Nueva Segovia" />
                <Field label="MUNICIPIO" value="" />
                <Field label="COMUNIDAD" value="" />
                <Field label="NOMBRE DE LA ESCUELA" value="" />
                <Field label="DIRECCIÓN DE LA ESCUELA" value="" />
                <Field label="PROG. O ESTRATEGIA" value="" />
                <Field label="ESPECIALIDAD O CURSO" value={enrollment.carreraTecnica} />
                <Field label="MODO/NIVEL DE FORMACIÓN" value="" />
                <Field label="GRUPO" value="" />
                <Field label="TURNO" value="" />
                <Field label="AÑO" value="2025" />
                <Field label="FECHA DE INICIO" value="" />
                <Field label="HORARIO" value="" />
            </View>
        </View>

      {/* --- INICIO DE LA CORRECCIÓN DEL FOOTER --- */}
      <View style={styles.footer}>
        <View style={styles.signatureContainer}>
          {enrollment.firmaProtagonista && (
            <Image style={styles.firmaImage} src={enrollment.firmaProtagonista} />
          )}
          <Text style={styles.signatureLine}>Firma del Protagonista</Text>
        </View>
        <View style={styles.signatureContainer}>
           {/* Aquí podrías poner la firma de registro si la tuvieras */}
          <Text style={styles.signatureLine}>Firma de Registro</Text>
        </View>
      </View>
      {/* --- FIN DE LA CORRECCIÓN DEL FOOTER --- */}
    </Page>

    {/* --- Páginas de imágenes (sin cambios) --- */}
    {(enrollment.cedulaFileFrente || enrollment.cedulaFileReverso) && (
      <Page size="A4" style={styles.imagePage}>
        {enrollment.cedulaFileFrente && (
          <Image style={styles.image} src={enrollment.cedulaFileFrente} />
        )}
        {enrollment.cedulaFileReverso && (
          <Image style={styles.image} src={enrollment.cedulaFileReverso} />
        )}
      </Page>
    )}
    {enrollment.birthCertificateFile && (
      <Page size="A4" style={styles.imagePage}>
        <Image style={styles.ImageNotasDiplomaNacimiento} src={enrollment.birthCertificateFile} />
      </Page>
    )}
    {enrollment.diplomaFile && (
      <Page size="A4" style={styles.imagePage} orientation='landscape'>
        <Image style={styles.ImageNotasDiplomaNacimiento} src={enrollment.diplomaFile} />
      </Page>
    )}
    {enrollment.gradesCertificateFile && (
      <Page size="A4" style={styles.imagePage}>
        <Image style={styles.ImageNotasDiplomaNacimiento} src={enrollment.gradesCertificateFile} />
      </Page>
    )}
  </Document>
);