"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Play, Pause, MapPin, ExternalLink, GraduationCap, Award, X } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface University {
  id: string
  name: string
  description: string
  logo: string
  location: string
  programs: string
  website?: string
  mapsUrl?: string
  backgroundImage?: string
}

const universities: University[] = [
  {
    id: "1",
    name: "UNAN-Managua",
    description:
      "Universidad Nacional Autónoma de Nicaragua, Managua - Institución líder en educación superior con amplia trayectoria académica.",
    logo: "/estrategia-nacional/universidades/logo-unan-managua.png",
    location: "Managua, Nicaragua",
    programs: "Administración de Empresas, Contaduría pública y finanzas",
    website: "https://www.unan.edu.ni",
    mapsUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d975.2740956247329!2d-86.27102826290084!3d12.105553959566485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f715590dd6ce7a9%3A0xedbc07cfd988036c!2sNational%20Autonomous%20University%20of%20Nicaragua%20(UNAN)!5e0!3m2!1sen!2sni!4v1761767247063!5m2!1sen!2sni",
    backgroundImage: "/estrategia-nacional/universidades/banner-unan-managua.jpg",
  },
  {
    id: "2",
    name: "UNAN-León",
    description:
      "Universidad Nacional Autónoma de Nicaragua, León - Centenaria institución con fuerte tradición académica y de investigación.",
    logo: "/estrategia-nacional/universidades/logo-unan-managua.png",
    location: "León, Nicaragua",
    programs: "Administración de Empresas, Contaduría pública y finanzas",
    website: "https://www.unanleon.edu.ni",
    mapsUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4501.7916178007745!2d-86.8768027655748!3d12.418693882176317!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f7120265918fad1%3A0x421e0f5ac7a2ea30!2sFaculty%20of%20Economics%20and%20Business!5e0!3m2!1sen!2sni!4v1761767511515!5m2!1sen!2sni",
    backgroundImage: "/estrategia-nacional/universidades/banner-unan-leon.jpg",
  },
  {
    id: "3",
    name: "UNA",
    description:
      "Universidad Nacional Agraria - Especializada en ciencias agropecuarias y desarrollo rural sostenible.",
    logo: "/estrategia-nacional/universidades/logo-una.webp",
    location: "Managua, Nicaragua",
    programs: "Administración de Empresas, Medicina Veterinaria , Medicina Veterinaria y Zootecnia, Ingeniería en Zootecnia, Ingeniería agronómica",
    website: "https://www.una.edu.ni",
    mapsUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7801.070407259541!2d-86.17284200642088!3d12.143921800000012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f73fbe4fe381621%3A0x6484ee4cf0deb1ff!2sUniversidad%20Nacional%20Agraria%20-%20Sede%20Central!5e0!3m2!1sen!2sni!4v1761768032427!5m2!1sen!2sni",
    backgroundImage: "/estrategia-nacional/universidades/banner-una.webp",
  },
  {
    id: "4",
    name: "URACCAN",
    description:
      "Universidad de las Regiones Autónomas de la Costa Caribe Nicaragüense - Enfoque en educación intercultural y desarrollo comunitario.",
    logo: "/estrategia-nacional/universidades/logo-uraccan.png",
    location: "Costa Caribe Nicaragüense",
    programs: "Administración de Empresas, Contaduría pública y finanzas, Medicina Veterinaria, Medicina Veterinaria y Zootecnia, Ingeniería en Zootecnia",
    website: "https://www.uraccan.edu.ni",
    mapsUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d19502.43892133745!2d-83.40376759185699!3d14.090510697400525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f119b3fa895d765%3A0x28cd739130b3c9a7!2sUniversidad%20URACCAN%2C%20Bilwi!5e0!3m2!1sen!2sni!4v1761768540224!5m2!1sen!2sni",
    backgroundImage: "/estrategia-nacional/universidades/banner-uraccan.jpg",
  },
  {
    id: "5",
    name: "BICU",
    description:
      "Bluefields Indian & Caribbean University - Comprometida con el desarrollo de la Costa Caribe y pueblos originarios.",
    logo: "/estrategia-nacional/universidades/logo-bicu.png",
    location: "Bluefields, Nicaragua",
    programs: "Administración de Empresas, Medicina Veterinaria, Medicina Veterinaria y Zootecnia, Ingeniería en Zootecnia, Contaduría pública y finanzas",
    website: "https://www.bicu.edu.ni",
    mapsUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3902.5474059135863!2d-83.7711023!3d12.0057875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f0c08030c672191%3A0x1d0d870998981739!2sBluefields%20Indian%20%26%20Caribbean%20University%20(BICU)!5e0!3m2!1sen!2sni!4v1761770798568!5m2!1sen!2sni",
    backgroundImage: "/estrategia-nacional/universidades/banner-bicu.jpg",
  },
  {
    id: "6",
    name: "UNIAV",
    description: "Universidad de la Asunción - Institución privada con programas técnicos y profesionales innovadores.",
    logo: "/estrategia-nacional/universidades/logo-uniav.png",
    location: "Rivas, Nicaragua",
    programs: "Medicina Veterinaria y Zootecnia, Ingeniería en Zootecnia, Ingeniería agronómica",
    website: "https://www.uniav.edu.ni",
    mapsUrl:
      "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15642.17244263356!2d-85.8308688!3d11.4406711!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f744ec4a57735c7%3A0x51f164ac96356cf6!2sUNIAV%3A%20Universidad%20Internacional%20Antonio%20de%20Valdivieso!5e0!3m2!1sen!2sni!4v1761772074237!5m2!1sen!2sni",
    backgroundImage: "/estrategia-nacional/universidades/banner-uniav.jpeg",
  },
  {
    id: "7",
    name: "UNP",
    description: "Universidad Nacional Politécnica - Especializada en ingenierías y tecnologías con enfoque práctico.",
    logo: "/estrategia-nacional/universidades/logo-unp.webp",
    location: "Managua, Nicaragua",
    programs: "Administración de Empresas, Contaduría pública y finanzas",
    website: "https://www.unp.edu.ni",
    mapsUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7801.215746163476!2d-86.22189015299921!3d12.138960117014827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f73fd927f45308f%3A0x6d50af9f14ce064c!2sUniversidad%20Nacional%20Polit%C3%A9cnica%20(UNP)!5e0!3m2!1sen!2sni!4v1761772555233!5m2!1sen!2sni",
    backgroundImage: "/estrategia-nacional/universidades/banner-unp.jpg",
  },
  {
    id: "8",
    name: "UNCSM",
    description:
      "Universidad Nacional de Ciencias Médicas - Formando profesionales en el área de la salud y ciencias médicas.",
    logo: "/estrategia-nacional/universidades/logo-uncsm.png",
    location: "Managua, Nicaragua",
    programs: "Administración de Empresas, Contaduría pública y finanzas",
    website: "https://www.uncsm.edu.ni",
    mapsUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.805427051447!2d-86.27340052485715!3d12.12546153286391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f7155d2dba3c2a1%3A0x3c338a111e467ce4!2sUniversidad%20Nacional%20Casimiro%20Sotelo%20Montenegro%20(UNCSM)!5e0!3m2!1sen!2sni!4v1761773507409!5m2!1sen!2sni",
    backgroundImage: "/estrategia-nacional/universidades/banner-uncsm.jpg",
  },
  {
    id: "9",
    name: "UNFLEP",
    description:
      "Universidad Nacional Francisco Luis Espinoza Pineda - Comprometida con la educación superior accesible y de calidad.",
    logo: "/estrategia-nacional/universidades/logo-unflep.png",
    location: "Estelí, Nicaragua",
    programs: "Administración de Empresas, Medicina Veterinaria, Medicina Veterinaria y Zootecnia, Ingeniería en Zootecnia, Ingeniería agronómica",
    website: "https://unflep.edu.ni/",
    mapsUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31069.182854957864!2d-86.41101121902467!3d13.247402156805668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f71f17be387639b%3A0xb47fe5009a1079ea!2sUniversidad%20Francisco%20Luis%20Espinoza%20Pineda!5e0!3m2!1sen!2sni!4v1761774203900!5m2!1sen!2sni",
    backgroundImage: "/estrategia-nacional/universidades/banner-unflep.jpeg",
  },
]

export default function UniversityCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [showMap, setShowMap] = useState(false)
  const [selectedMapUrl, setSelectedMapUrl] = useState("")

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % universities.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % universities.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + universities.length) % universities.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const openMap = (mapsUrl: string) => {
    setSelectedMapUrl(mapsUrl)
    setShowMap(true)
  }

  return (
    <div className="relative py-12 md:py-20 overflow-hidden">
      <div className="container relative mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 mx-3 px-5  py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4 md:mb-6"
          >
            <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs md:text-sm font-semibold text-blue-700 dark:text-blue-300">
              Educación Superior
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-slate-900 dark:text-white text-balance"
          >
            Universidades que te{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Esperan
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto text-pretty leading-relaxed"
          >
            Conoce las instituciones de educación superior donde podrás continuar tus estudios con reconocimiento de tus
            competencias técnicas
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative w-full mx-auto"
        >
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 border border-slate-200/50 dark:border-slate-800">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full min-h-[480px] md:min-h-[450px]"
              >
                <div className="h-full md:h-[460px] flex flex-col md:flex-row">
                  <div className="md:w-2/5 relative p-6 md:p-8 flex flex-col items-center justify-center overflow-hidden">
                    <motion.div
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.7 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={universities[currentSlide].backgroundImage || "/placeholder.svg"}
                        alt={`Campus ${universities[currentSlide].name}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-cyan-900/80 to-blue-900/85 dark:from-slate-900/90 dark:via-blue-950/85 dark:to-slate-900/90" />
                    </motion.div>

                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative w-32 h-32 md:w-44 md:h-44 lg:w-48 lg:h-48 mb-3 md:mb-5 group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                        <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-2xl border border-white/50 dark:border-slate-700/50">
                          <Image
                            src={universities[currentSlide].logo || "/placeholder.svg"}
                            alt={`Logo ${universities[currentSlide].name}`}
                            layout="fill"
                            objectFit="contain"
                            className="p-2 md:p-3"
                          />
                        </div>
                      </motion.div>

                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="text-xl md:text-2xl lg:text-3xl font-bold text-center text-white mb-2 md:mb-3 text-balance drop-shadow-lg"
                      >
                        {universities[currentSlide].name}
                      </motion.h3>

                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          universities[currentSlide].mapsUrl && openMap(universities[currentSlide].mapsUrl)
                        }
                        className="flex items-center gap-2 text-white/90 hover:text-white mb-3 md:mb-4 bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 md:px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg group border border-white/20"
                      >
                        <MapPin className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
                        <span className="text-xs md:text-sm lg:text-base font-medium">
                          {universities[currentSlide].location}
                        </span>
                      </motion.button>

                      <motion.a
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={universities[currentSlide].website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link md:px-6 py-2 md:py-3 bg-white hover:bg-slate-50 text-blue-600 hover:text-blue-700 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <ExternalLink className="w-3 h-3 md:w-4 md:h-4 group-hover/link:rotate-12 transition-transform duration-300" />
                        Visitar sitio web
                      </motion.a>
                    </div>
                  </div>

                  <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mb-5 md:mb-6"
                    >
                      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                        <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h4 className="text-base md:text-xl font-bold text-slate-900 dark:text-white">
                          Carreras con continuidad
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {universities[currentSlide].programs.split(", ").map((program, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            className="group px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-xs md:text-sm font-semibold border border-blue-200/50 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-300"
                          >
                            {program}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                        <div className="p-1.5 md:p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                          <Award className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h4 className="text-base md:text-xl font-bold text-slate-900 dark:text-white">
                          Acerca de la universidad
                        </h4>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base lg:text-lg text-pretty text-left">
                        {universities[currentSlide].description}
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevSlide}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-md rounded-full p-2 md:p-3 transition-all duration-300 shadow-xl border border-slate-200/50 dark:border-slate-700/50 group"
              aria-label="Universidad anterior"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextSlide}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-md rounded-full p-2 md:p-3 transition-all duration-300 shadow-xl border border-slate-200/50 dark:border-slate-700/50 group"
              aria-label="Siguiente universidad"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-md rounded-full p-2 md:p-2.5 transition-all duration-300 shadow-lg border border-slate-200/50 dark:border-slate-700/50 group"
              aria-label={isAutoPlaying ? "Pausar reproducción automática" : "Iniciar reproducción automática"}
            >
              {isAutoPlaying ? (
                <Pause className="h-4 w-4 md:h-5 md:w-5 text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              ) : (
                <Play className="h-4 w-4 md:h-5 md:w-5 text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              )}
            </motion.button>
          </div>

          <div className="flex justify-center mt-6 md:mt-10 gap-2">
            {universities.map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? "w-8 md:w-12 h-2 md:h-3 bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/50"
                    : "w-2 md:w-3 h-2 md:h-3 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600"
                }`}
                aria-label={`Ir a universidad ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowMap(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl h-[70vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMap(false)}
                className="absolute top-4 right-4 z-10 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full p-2 shadow-lg transition-all duration-300 group"
                aria-label="Cerrar mapa"
              >
                <X className="h-5 w-5 text-slate-700 dark:text-slate-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
              </motion.button>
              <iframe
                src={selectedMapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
