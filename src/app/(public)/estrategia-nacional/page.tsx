"use client";

import type React from "react";
import { motion, useInView } from "framer-motion";
import { Marquee } from "@/components/register/public/estrategia-nacional/marquee";
import { useRef } from "react";
import { MdBusinessCenter, MdPets, MdSchool } from "react-icons/md";
import { GiFarmTractor } from "react-icons/gi";
import { ModeToggle } from "@/components/mode-toggle";
import ContactSection from "@/components/register/public/contact-section";
import Link from "next/link";
import Image from "next/image";

const institutions = [
  {
    name: "MINED",
    description: "Ministerio de Educación",
    logo: "/estrategia-nacional/mined-logo.png",
  },
  {
    name: "INATEC",
    description: "Tecnológico Nacional",
    logo: "/logo-inatec-2016.png",
  },
  {
    name: "CNU",
    description: "Consejo Nacional de Universidades",
    logo: "/estrategia-nacional/cnu-logo.png",
  },
  {
    name: "SEAR",
    description: "Subsistema Educativo, Atonomico Regional",
    logo: "/estrategia-nacional/sear-logo.png",
  },
  {
    name: "SETEC",
    description: "Subsistema de Educación Técnica",
    logo: "/estrategia-nacional/setec-logo.png",
  },
  {
    name: "Gobierno de Nicaragua",
    description: "Gobierno de Reconciliación y Unidad Nacional",
    logo: "/estrategia-nacional/Logo-Gobierno.png",
  },
];

interface Career {
  title: string;
  subtitle: string;
  university: string;
  year: string;
  secondYearText: string;
  thirdYearText: string;
  secondYearUniversities: string[];
  thirdYearUniversities: string[];
  description: string;
  icon: React.ReactNode;
  gradient: string;
  darkGradient: string;
  badgeColor: string;
  badgeBorder: string;
  image: string;
}

const careers: Career[] = [
    {
        title: "Administración",
        subtitle: "Técnico General en Administración",
        university: "Licenciatura en Administración de Empresas",
        year: "Segundo año",
        secondYearText: "Ingreso a 2do año",
        thirdYearText: "Ingreso a 3er año",
        secondYearUniversities: [
          "UNAN-Managua", "UNP", "UNCSM", "UNA", "BICU", "UNFLEP", "URACCAN",
        ],
        thirdYearUniversities: ["UNAN-León"],
        description:
          "Convalida materias técnicas de administración, contabilidad y gestión para continuar estudios universitarios con avance curricular.",
        icon: <MdBusinessCenter className="w-7 h-7 text-white" />,
        gradient: "from-blue-600 to-blue-700",
        darkGradient: "from-blue-700 to-blue-800",
        badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
        badgeBorder: "border-blue-200 dark:border-blue-800",
        image: "/estrategia-nacional/tg-administracion.jpg",
      },
      {
        title: "Veterinaria",
        subtitle: "Técnico General en Veterinaria",
        university: "Medicina Veterinaria / Medicina Veterinaria y Zootecnia",
        year: "Segundo año",
        secondYearText: "Ingreso a 2do año Medicina Veterinaria",
        thirdYearText: "Ingreso a 3er año Medicina Veterinaria y Zootecnia",
        secondYearUniversities: ["URACCAN", "BICU", "UNA", "UNFLEP"],
        thirdYearUniversities: ["UNIAV"],
        description:
          "Formación en salud animal, sanidad y aspectos clínicos. Las convalidaciones permiten continuar en carreras veterinarias con reconocimiento de competencias técnicas.",
        icon: <MdPets className="w-7 h-7 text-white" />,
        gradient: "from-emerald-600 to-emerald-700",
        darkGradient: "from-emerald-700 to-emerald-800",
        badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
        badgeBorder: "border-emerald-200 dark:border-emerald-800",
        image: "/veterinaria/img18.jpeg",
      },
      {
        title: "Zootecnia",
        subtitle: "Técnico General en Zootecnia",
        university: "Medicina Veterinaria y Zootecnia / Ingeniería en Zootecnia",
        year: "Segundo año",
        secondYearText: "Ingreso a 2do año ambas carreras",
        thirdYearText: "Ingreso a 3er año (si aplica)",
        secondYearUniversities: ["UNA", "URACCAN", "UNFLEP", "BICU", "UNIAV"],
        thirdYearUniversities: [],
        description:
          "Enfocado en producción animal, manejo de especies y mejoramiento genético. Facilita el acceso a programas universitarios con créditos convalidados.",
        icon: <GiFarmTractor className="w-7 h-7 text-white" />,
        gradient: "from-amber-600 to-amber-700",
        darkGradient: "from-amber-700 to-amber-800",
        badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
        badgeBorder: "border-amber-200 dark:border-amber-800",
        image: "/zootecnia/img5.jpg",
      },
];

const benefits = [
    {
      title: "Ahorro de Tiempo",
      description:
        "Avanza al segundo o tercer año universitario sin repetir contenidos ya dominados.",
      icon: (
        <svg
          className="w-7 h-7 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Ahorro Económico",
      description:
        "Reduce costos de matrícula y materiales al convalidar años completos de estudio.",
      icon: (
        <svg
          className="w-7 h-7 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      gradient: "from-cyan-500 to-cyan-600",
    },
    {
      title: "Mayor Empleabilidad",
      description:
        "Combina formación técnica práctica con conocimientos universitarios avanzados.",
      icon: (
        <svg
          className="w-7 h-7 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-500",
    },
];

const features = [
    {
      title: "Reconocimiento de competencias",
      description: "Convalidación de asignaturas y saberes técnicos adquiridos",
      icon: (
        <svg
          className="w-5 h-5 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Vinculación institucional",
      description: "Articulación entre centros técnicos y universidades públicas",
      icon: (
        <svg
          className="w-5 h-5 text-cyan-600 dark:text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    },
    {
      title: "Desarrollo del talento humano",
      description: "Responde a necesidades productivas y de desarrollo local",
      icon: (
        <svg
          className="w-5 h-5 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Formación integral",
      description: "Fortalece el vínculo entre educación técnica y superior",
      icon: (
        <svg
          className="w-5 h-5 text-cyan-600 dark:text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    },
];

function AnimatedSection({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ delay, duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CareerCard({ career, index }: { career: Career; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <AnimatedSection delay={index * 0.1} className="w-full">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ delay: index * 0.1, duration: 0.6 }}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
        className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 h-full flex flex-col w-full"
      >
        <div className="relative h-56 overflow-hidden">
          <Image
            src={career.image || "/placeholder.svg"}
            alt={career.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-500 group-hover:scale-105"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-r ${career.gradient} dark:${career.darkGradient} opacity-70`}
          />
          <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                {career.icon}
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {career.title}
                </h3>
                <p className="text-white/90 text-xs sm:text-sm font-medium">
                  {career.subtitle}
                </p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <a
              href="https://ct-jalapa-matriculas-2026.vercel.app/public-register"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 sm:px-6 sm:py-3 rounded-full bg-white text-slate-900 font-semibold shadow-lg hover:scale-105 transition-transform duration-300 flex items-center gap-2 text-sm sm:text-base"
            >
              <MdSchool className="w-4 h-4 sm:w-5 sm:h-5" />
              Matricúlate ahora
            </a>
          </div>
        </div>
        <div className="p-4 sm:p-6 flex-1 flex flex-col">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Continúa con:
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
              {career.university}
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
              {career.description}
            </p>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {career.secondYearText}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {career.secondYearUniversities.map(
                  (uni: string, uniIndex: number) => (
                    <span
                      key={uniIndex}
                      className={`px-2 py-1 sm:px-3 sm:py-1.5 ${career.badgeColor} ${career.badgeBorder} rounded-full text-xs font-medium border`}
                    >
                      {uni}
                    </span>
                  )
                )}
              </div>
            </div>
            {career.thirdYearUniversities.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {career.thirdYearText}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {career.thirdYearUniversities.map(
                    (uni: string, uniIndex: number) => (
                      <span
                        key={uniIndex}
                        className="px-2 py-1 sm:px-3 sm:py-1.5 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-800"
                      >
                        {uni}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatedSection>
  );
}

export default function ContinuidadEducativa() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white dark:bg-slate-950">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="pt-20 pb-16 px-4 sm:px-6"
      >
        <div className="absolute top-2 right-4">
          <ModeToggle />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-block px-4 py-1.5 rounded-full text-blue-700 dark:text-blue-300 text-lg font-medium mb-6 lg:mb-10 lg:text-3xl"
          >
            Centro Tenólogico de Jalapa
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white"
          >
            Programa de
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Continuidad Educativa
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12 font-light leading-relaxed"
          >
            Articula tu formación técnica con estudios universitarios. Avanza
            directamente al segundo o tercer año reconociendo tus competencias.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="#carreras"
              className="px-6 py-3 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 w-full sm:w-auto text-center"
            >
              Explorar Carreras
            </a>
            <a
              href="#beneficios"
              className="px-6 py-3 sm:px-8 sm:py-4 rounded-full text-slate-700 dark:text-slate-200 font-semibold text-base sm:text-lg border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 w-full sm:w-auto text-center"
            >
              Conocer Beneficios
            </a>
          </motion.div>
        </div>
      </motion.section>

      <section className="py-12 px-4 sm:px-6">
        <Marquee pauseOnHover className="[--duration:40s]">
          {institutions.map((institution, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white dark:bg-slate-200 rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 min-w-[150px] sm:min-w-[180px] mx-2 sm:mx-3 cursor-pointer"
            >
              <div className="relative w-full h-16 sm:h-20">
                <Image
                  src={institution.logo || "/placeholder.svg"}
                  alt={institution.name}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </motion.div>
          ))}
        </Marquee>
      </section>

      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white">
                Una Estrategia Nacional Integrada
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                El{" "}
                <strong className="text-slate-900 dark:text-white">
                  Programa de Continuidad Educativa y Orientación Profesional
                </strong>{" "}
                es una estrategia impulsada por el Sistema Educativo Nacional de
                Nicaragua, que une los esfuerzos de seis instituciones clave
                para garantizar que los egresados de la educación técnica puedan
                continuar sus estudios universitarios de forma articulada.
              </p>
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <AnimatedSection delay={0.1}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl text-center lg:text-left font-bold mb-4 sm:mb-6 tracking-tight text-slate-900 dark:text-white">
                ¿En qué consiste la estrategia?
              </h2>
              <p className="text-base sm:text-lg text-center lg:text-left text-slate-600 dark:text-slate-300 mb-4 sm:mb-6 leading-relaxed">
                Esta estrategia busca{" "}
                <strong className="text-slate-900 dark:text-white">
                  promover la formación integral del talento humano
                </strong>
                , fortalecer el vínculo entre la educación técnica y superior, y
                responder a las demandas de desarrollo económico y social del
                país.
              </p>
              <p className="text-base sm:text-lg text-center lg:text-left text-slate-600 dark:text-slate-300 mb-4 sm:mb-6 leading-relaxed">
                Su propósito es{" "}
                <strong className="text-blue-600 dark:text-blue-400">
                  reconocer y convalidar
                </strong>{" "}
                las competencias y materias cursadas en institutos técnicos para
                que los egresados puedan ingresar a la universidad y avanzar
                directamente al{" "}
                <strong className="text-blue-600 dark:text-blue-400">
                  segundo o tercer año
                </strong>{" "}
                según el caso.
              </p>
              <p className="text-sm sm:text-base text-center lg:text-left text-slate-500 dark:text-slate-400 italic">
                Especialmente enfocado en los territorios donde se requieren
                profesionales calificados para impulsar el desarrollo local.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/30 dark:border-slate-700/30">
                <div className="space-y-4 sm:space-y-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="flex items-start gap-3 sm:gap-4"
                    >
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${feature.bgColor} flex items-center justify-center flex-shrink-0`}
                      >
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm sm:text-base">
                          {feature.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section id="beneficios" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white">
                Beneficios del Programa
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300">
                Ventajas de continuar tu formación educativa
              </p>
            </div>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full"
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-4 sm:mb-6`}
                  >
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-slate-900 dark:text-white">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                    {benefit.description}
                  </p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section id="carreras" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto w-full">
          <AnimatedSection>
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900 dark:text-white">
                Carreras Disponibles
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300">
                Carreras Técnicas con opción de continuidad que puedes estudiar
                en el centro tecnológico de Jalapa
              </p>
            </div>
          </AnimatedSection>
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 w-full">
            {careers.map((career, index) => (
              <CareerCard key={index} career={career} index={index} />
            ))}
          </div>
          <div className="mt-16 text-center">
            <motion.div
              className="inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/public-register"
                className="inline-block px-2 py-4 lg:px-8  text-sm lg:text-lg font-semibold text-white bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Mira las Actividades de nuestros Estudiantes
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="contacto" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className=" mx-auto w-full">
          <AnimatedSection>
            <ContactSection />
            <div className="flex justify-center  text-sm text-black/45 dark:text-white/45">
              <p>
                &copy; {new Date().getFullYear()}{" "}
                <span>
                  <Link
                    href="https://www.instagram.com/garciawes12/"
                    target="_blank"
                  >
                    Wesling García
                  </Link>
                </span>
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}