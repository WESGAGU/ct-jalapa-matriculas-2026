import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { Register } from '@/lib/types';
import { Career, Register as PrismaRegister } from '@prisma/client';

// --- ESTILOS MODIFICADOS ---
const styles = StyleSheet.create({
  // Ajuste 1: Reducir padding general y cambiar a tamaño CARTA (LETTER)
  page: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 25,
    fontFamily: 'Helvetica',
    fontSize: 9.5, // Ajuste 2: Reducir ligeramente el tamaño de fuente base
    color: '#333'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5, // Reducido
  },
  logoLeft: { width: 110, height: 30 },
  logoRight: { width: 60, height: 40 },
  centerContent: { flex: 1, alignItems: 'center', marginHorizontal: 10 },
  title: { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 }, // Ligeramente más pequeño
  subtitle: { fontSize: 11, fontWeight: 'bold' },
  topInfoContainer: {
    marginBottom: 10, // Reducido de 15
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3, // Reducido de 5
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 110,
    fontSize: 8, // Coherente con la base
  },
  infoLabel2: {
    fontSize: 8, // Coherente con la base
    position: 'relative',
    left: 250,
    fontWeight: 'bold'
  },
  infoValue: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
    paddingBottom: 1,
    fontSize: 8, // Coherente con la base
    marginRight: 10,
  },
  secondInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3, // Reducido de 5
  },
  dateEmailContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '65%',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10, // Reducido de 15
    fontSize: 9, // Ligeramente más pequeño
  },
  infoColumn: { width: '65%' },
  section: { padding: "2px 5px" }, // Reducido el padding vertical
  sectionTitle: {
    padding: 3, // Reducido
    fontSize: 10,  // Reducido
    fontWeight: 'bold',
    marginBottom: 5, // Reducido de 8
    textAlign: 'center'
  },
  grid: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap' },
  field: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '50%',
    paddingRight: 10,
    marginBottom: 3, // Ajuste 3: Reducir el espacio entre campos (clave)
  },
  fieldFull: { width: '100%' },
  label: { fontSize: 8, fontWeight: 'bold', width: 140 },
  value: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#666', paddingBottom: 1 },
  footer: {
    position: 'absolute',
    bottom: 30, // Ajuste 4: Subir el pie de página para que coincida con el nuevo padding
    left: 40,
    right: 40,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20, // Reducido
    textAlign: 'center',
    fontSize: 9
  },
  signatureContainer: {
    width: 220,
    position: 'relative',
    alignItems: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 5,
    width: 200
  },
  firmaImage: {
    position: 'absolute',
    width: 150,
    height: 60,
    top: -40,
    objectFit: 'contain',
  },
  // --- Estilos de las páginas de imágenes (sin cambios) ---
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

const Field = ({ label, value, fullWidth = false }: { label: string; value: string | number | null | undefined; fullWidth?: boolean }) => (
  <View style={fullWidth ? [styles.field, styles.fieldFull] : styles.field}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || ' '}</Text>
  </View>
);

interface EnrollmentPDFProps {
  enrollment: (Register | PrismaRegister) & { career?: Career | null };
}

export const EnrollmentPDF = ({ enrollment }: EnrollmentPDFProps) => (
  <Document>
    {/* Ajuste 5: Cambiar a tamaño CARTA (LETTER) */}
    <Page size="LETTER" style={styles.page}>
      {/* El resto del JSX no necesita cambios */}
      
      {/* Encabezado con logos */}
      <View style={styles.header}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image
          style={styles.logoLeft}
          src="/pdf-logo-izquierda.jpg"
        />
        <View style={styles.centerContent}>
          <Text style={styles.title}>HOJA DE MATRÍCULA 2026</Text>
        </View>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
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

      {/* Secciones de datos */}
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
                <Field label="COMUNIDAD DOMICILIAR" value={enrollment.comunidad} />
                <Field label="PROFESIÓN" value="" />
                <Field label="DIRECCIÓN DOMICILIAR" value={enrollment.direccion} fullWidth />
                <Field label="TELÉFONO CELULAR" value={enrollment.telefonoCelular} />
                <Field label="TELÉFONO DOMICILIAR" value="" />
                <Field label="EMAIL" value={enrollment.email} />
                <Field label="ÁREA" value="" />
                <Field label="NIVEL ACADÉMICO" value={enrollment.nivelAcademico} />
                <Field label="IDIOMA" value="Español" />
                <Field label="DISCAPACIDAD" value="" />
                <Field label="PROGRAMA DE EGRESO" value="" />
                <Field label="MATRICULA" value="" />
                <Field label="AÑO DE BACHILLERATO" value="" />
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
                <Field label="DEPARTAMENTO" value={enrollment.deptoDomiciliar} />
                <Field label="MUNICIPIO" value="" />
                <Field label="COMUNIDAD" value="" />
                <Field label="NOMBRE DE LA ESCUELA" value="" />
                <Field label="DIRECCIÓN DE LA ESCUELA" value="" />
                <Field label="PROG. O ESTRATEGIA" value="" />
                <Field label="ESPECIALIDAD O CURSO" value={enrollment.carreraTecnica} />
                <Field label="MODO/NIVEL DE FORMACIÓN" value="" />
                <Field label="GRUPO" value="" />
                <Field label="TURNO" value={enrollment.career?.shift || 'No especificado'} />
                <Field label="AÑO" value="2026" />
                <Field label="FECHA DE INICIO" value="" />
                <Field label="HORARIO" value="" />
            </View>
        </View>
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>V. DOCUMENTOS PRESENTADOS</Text>
        </View>
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>VI. OBSERVACIONES</Text>
        </View>

      {/* Footer con firmas */}
      <View style={styles.footer}>
        <View style={styles.signatureContainer}>
          {enrollment.firmaProtagonista && (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image style={styles.firmaImage} src={enrollment.firmaProtagonista} />
          )}
          <Text style={styles.signatureLine}>Firma del Protagonista</Text>
        </View>
        <View style={styles.signatureContainer}>
          <Text style={styles.signatureLine}>Firma de Registro</Text>
        </View>
      </View>
    </Page>

    {/* Páginas de imágenes (sin cambios) */}
    {(enrollment.cedulaFileFrente || enrollment.cedulaFileReverso) && (
      <Page size="LETTER" style={styles.imagePage}>
        {enrollment.cedulaFileFrente && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image style={styles.image} src={enrollment.cedulaFileFrente} />
        )}
        {enrollment.cedulaFileReverso && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image style={styles.image} src={enrollment.cedulaFileReverso} />
        )}
      </Page>
    )}
    {enrollment.birthCertificateFile && (
      <Page size="LETTER" style={styles.imagePage}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.ImageNotasDiplomaNacimiento} src={enrollment.birthCertificateFile} />
      </Page>
    )}
    {enrollment.diplomaFile && (
      <Page size="LETTER" style={styles.imagePage} orientation='landscape'>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.ImageNotasDiplomaNacimiento} src={enrollment.diplomaFile} />
      </Page>
    )}
    {enrollment.gradesCertificateFile && (
      <Page size="LETTER" style={styles.imagePage}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image style={styles.ImageNotasDiplomaNacimiento} src={enrollment.gradesCertificateFile} />
      </Page>
    )}
  </Document>
);