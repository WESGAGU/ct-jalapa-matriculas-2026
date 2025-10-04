"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, Pause, X, Eye } from "lucide-react"
import GradientText from '@/components/ui/GradientText'
import Image from "next/image"

interface Activity {
  id: string
  title: string
  description: string
  career: string
  image: string
  date: string
  location: string
  participants: number
  duration: string
  type: string
  galleryImages?: string[]
}

const careerGalleries = {
  Computación: [
    "/computacion/img1.jpg",
    "/computacion/img2.jpg",
    "/computacion/img3.jpg",
    "/computacion/img4.jpg",
    "/computacion/img5.jpg",
    "/computacion/img6.jpg",
    "/computacion/img7.jpg",
    "/computacion/img8.jpg",
    "/computacion/img9.jpg",
    "/computacion/img10.jpg",
    "/computacion/img11.jpg",
    "/computacion/img12.jpg",
    "/computacion/img13.jpg",
    "/computacion/img14.jpg",
    "/computacion/img15.jpg",
    "/computacion/img16.jpg",
    "/computacion/img17.jpg",
  ],
  Contabilidad: [
    "/contabilidad/img1.jpg",
    "/contabilidad/img2.jpg",
    "/contabilidad/img3.jpg",
    "/contabilidad/img4.jpg",
    "/contabilidad/img5.jpg",
    "/contabilidad/img6.jpg",
    "/contabilidad/img7.jpg",
    "/contabilidad/img8.jpg",
    "/contabilidad/img9.jpg",
    "/contabilidad/img10.jpg",
    "/contabilidad/img11.jpg",
  ],
  Administración: [
    "/administracion/img1.jpg",
    "/administracion/img2.jpg",
    "/administracion/img3.jpg",
    "/administracion/img4.jpg",
    "/administracion/img5.jpg",
    "/administracion/img6.jpg",
    
  ],
  Veterinaria: [
    "/veterinaria/img1.jpg",
    "/veterinaria/img2.jpg",
    "/veterinaria/img3.jpg",
    "/veterinaria/img4.jpg",
    "/veterinaria/img5.jpg",
    "/veterinaria/img6.jpg",
    "/veterinaria/img7.jpg",
    "/veterinaria/img8.jpg",
    "/veterinaria/img9.jpg",
    "/veterinaria/img10.jpg",
    "/veterinaria/img11.jpg",
    "/veterinaria/img12.jpg",
    "/veterinaria/img13.jpg",
    "/veterinaria/img14.jpg",
    "/veterinaria/img15.jpg",
    "/veterinaria/img16.jpg",
    "/veterinaria/img17.jpg",
    "/veterinaria/img18.jpeg",
    "/veterinaria/img19.jpeg",
  ],
  Agropecuaria: [
    "/agropecuaria/img1.jpg",
    "/agropecuaria/img2.jpg",
    "/agropecuaria/img3.jpg",
    "/agropecuaria/img4.jpg",
    "/agropecuaria/img5.jpg",
    "/agropecuaria/img6.jpg",
    "/agropecuaria/img7.jpg",
    "/agropecuaria/img8.jpg",
    "/agropecuaria/img9.jpg",
    "/agropecuaria/img10.jpg",
    "/agropecuaria/img11.jpg",
    "/agropecuaria/img12.jpg",
    "/agropecuaria/img13.jpg",
    "/agropecuaria/img14.jpg",
  ],
  Agronomía: [
    "/agronomia/img1.jpg ",
    "/agronomia/img2.jpg",
    "/agronomia/img3.jpg",
    "/agronomia/img4.jpg",
    "/agronomia/img5.jpg",
    "/agronomia/img6.jpg",
    "/agronomia/img7.jpg",
    "/agronomia/img8.jpg",
    "/agronomia/img9.jpg",
    "/agronomia/img10.jpg",
    "/agronomia/img11.jpg",
    "/agronomia/img12.jpg",
    "/agronomia/img13.jpg",
    "/agronomia/img14.jpg",
    "/agronomia/img15.jpg",
  ],
  Zootecnia: [
    "/zootecnia/img1.jpg",
    "/zootecnia/img2.jpg",
    "/zootecnia/img3.jpg",
    "/zootecnia/img4.jpg",
    "/zootecnia/img5.jpg",
    "/zootecnia/img6.jpg",
    "/zootecnia/img7.jpg",
    "/zootecnia/img8.jpg",
    "/zootecnia/img9.jpg",
    "/zootecnia/img10.jpg",
  ],
  "Riego Agrícola": [
    "/riego/img1.jpg",
    "/riego/img2.jpg",
    "/riego/img3.jpg",
    "/riego/img4.jpg",
    "/riego/img5.jpg",
    "/riego/img6.jpg",
    "/riego/img7.jpg",
    "/riego/img8.jpg",
    "/riego/img9.jpg",
  ],
}

const activities: Activity[] = [
  {
    id: "1",
    title: "Técnico General en Computacón",
    description:
      "Formación en manejo de software, hardware y redes informáticas, preparando al estudiante para el mantenimiento y soporte tecnológico.",
    career: "Computación",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0GgBsz0DUBum7bLlDwBZQNk8qXIziq.png",
    date: "2024-01-15",
    location: "Laboratorio de Computación",
    participants: 25,
    duration: "4 horas",
    type: "30% Teoría",
  },
  {
    id: "2",
    title: "Técnico General en Contabilidad",
    description:
      "Forma profesionales capaces de registrar, analizar y controlar operaciones financieras aplicando normas contables vigentes.",
    career: "Contabilidad",
    image: "/contabilidad/img6.jpg",
    date: "2024-01-18",
    location: "Aula de Contabilidad",
    participants: 30,
    duration: "3 horas",
    type: "30% Teoría",
  },
  {
    id: "3",
    title: "Técnico General en Administración",
    description:
      "Capacita en la gestión eficiente de recursos humanos, financieros y materiales dentro de una empresa o institución.",
    career: "Administración",
    image: "/administracion/img2.jpg",
    date: "2024-01-20",
    location: "Sala de Conferencias",
    participants: 20,
    duration: "6 horas",
    type: "30% Teoría",
  },
  {
    id: "4",
    title: "Técnico General en Veterinaria",
    description: "Enseña el cuidado, manejo y salud de los animales domésticos y de granja, promoviendo el bienestar animal y la producción saludable.",
    career: "Veterinaria",
    image: "/veterinaria/img12.jpg",
    date: "2024-01-22",
    location: "Clínica Veterinaria INATEC",
    participants: 15,
    duration: "5 horas",
    type: "30% Teoría",
  },
  {
    id: "5",
    title: "Técnico General en Agropecuaria",
    description: "Desarrolla habilidades para la producción agrícola y pecuaria sostenible, aplicando técnicas modernas y ecológicas.",
    career: "Agropecuaria",
    image: "/agropecuaria/img12.jpg",
    date: "2024-01-25",
    location: "Invernaderos INATEC",
    participants: 18,
    duration: "8 horas",
    type: "30% Teoría",
  },
  {
    id: "6",
    title: "Técnico General en Agronomía",
    description: "Forma profesionales en el manejo de cultivos, fertilización, control de plagas y conservación del suelo para una agricultura eficiente.",
    career: "Agronomía",
    image: "/agronomia/img14.jpg",
    date: "2024-01-28",
    location: "Laboratorio de Genética",
    participants: 12,
    duration: "6 horas",
    type: "30% Teoría",
  },
  {
    id: "7",
    title: "Técnico General en Zootecnia",
    description: "Capacita en la cría, alimentación y manejo del ganado, aplicando técnicas que mejoran la productividad y el bienestar animal.",
    career: "Zootecnia",
    image: "/zootecnia/img11.jpg",
    date: "2024-02-01",
    location: "Finca Experimental",
    participants: 16,
    duration: "7 horas",
    type: "30% Teoría",
  },
  {
    id: "8",
    title: "Técnico General en Riego Agrícola",
    description: "Prepara al estudiante en la planificación, instalación y mantenimiento de sistemas de riego, garantizando el uso racional del agua en la producción agrícola.",
    career: "Riego Agrícola",
    image: "/riego/img2.jpg",
    date: "2024-02-05",
    location: "Campo de Prácticas",
    participants: 22,
    duration: "5 horas",
    type: "30% Teoría",
  },
]

export default function StudentActivities() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [selectedCareer, setSelectedCareer] = useState<string>("")
  const [galleryCurrentImage, setGalleryCurrentImage] = useState(0)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activities.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activities.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activities.length) % activities.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const openGallery = (career: string) => {
    setSelectedCareer(career)
    setGalleryCurrentImage(0)
    setIsGalleryOpen(true)
    setIsAutoPlaying(false)
  }

  const closeGallery = () => {
    setIsGalleryOpen(false)
    setSelectedCareer("")
    setGalleryCurrentImage(0)
    setIsAutoPlaying(true)
  }

  const nextGalleryImage = () => {
    const images = careerGalleries[selectedCareer as keyof typeof careerGalleries] || []
    setGalleryCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevGalleryImage = () => {
    const images = careerGalleries[selectedCareer as keyof typeof careerGalleries] || []
    setGalleryCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className=" bg-white dark:bg-background">
      {/* Activities Carousel */}
      <div className="container mx-auto  py-12 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <GradientText
            colors={["#0B0B0B", "#4079ff", "#4079ff", "#064E3B", "#40ffaa"]} // modo light
            animationSpeed={3}
            showBorder={false}
            className="custom-class text-sm md:text-lg lg:text-2xl font-bold mb-4 text-center text-card-foreground dark:hidden"
          >
           Mira algunas actividades educativas que realizan nuestros
            estudiantes
          </GradientText>

          <GradientText
            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]} // modo dark
            animationSpeed={4}
            showBorder={false}
            className="custom-class text-sm md:text-lg lg:text-2xl font-bold mb-4 text-center text-card-foreground hidden dark:block"
          >
            Mira algunas actividades educativas que realizan nuestros
            estudiantes
          </GradientText>
        </div>

        {/* Carousel Container */}
        <div className="relative w-full lg:max-w-6xl lg:mx-auto">
          {/* Main Carousel */}
          <div className="relative overflow-hidden rounded-2xl bg-card shadow-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="w-full flex-shrink-0 h-[440px] sm:h-[480px] md:h-[500px] lg:h-[550px]"
                >
                  <div className="relative h-full">
                    <div className="h-full overflow-hidden">
                      <Image
                        src={activity.image || "/placeholder.svg"}
                        alt={activity.title}
                        layout="fill"
                        objectFit="cover"
                        className="w-full h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 text-white">
                      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                        <Badge className="bg-orange-500 text-white font-semibold">
                          70% Práctica
                        </Badge>
                        <Badge className="bg-orange-500 text-white font-semibold">
                          30% Teoría
                        </Badge>
                      </div>

                      <h3 className="text-lg md:text-3xl font-bold mb-1 md:mb-3 text-balance">
                        {activity.title}
                      </h3>

                      <p className="text-xs md:text-lg text-white/90 mb-3 md:mb-4 text-pretty max-w-3xl line-clamp-2 md:line-clamp-none">
                        {activity.description}
                      </p>

                      <Button
                        onClick={() => openGallery(activity.career)}
                        variant="secondary"
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/30"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver actividades
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 md:p-3 transition-all duration-200"
              aria-label="Actividad anterior"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 md:p-3 transition-all duration-200"
              aria-label="Siguiente actividad"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </button>

            {/* Auto-play Control */}
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="absolute top-2 md:top-4 right-2 md:right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-200"
              aria-label={
                isAutoPlaying
                  ? "Pausar reproducción automática"
                  : "Iniciar reproducción automática"
              }
            >
              {isAutoPlaying ? (
                <Pause className="h-4 w-4 text-white" />
              ) : (
                <Play className="h-4 w-4 text-white" />
              )}
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 md:mt-8 gap-2">
            {activities.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? "bg-primary scale-125"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Ir a actividad ${index + 1}`}
              />
            ))}
          </div>

          {/* Activity Counter */}
          <div className="text-center mt-3 md:mt-4 text-muted-foreground">
            <span className="text-sm">
              {currentSlide + 1} de {activities.length} carreras técnicas
            </span>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl md:max-w-4xl lg:max-w-5xl">
            {/* Close Button */}
            <button
              onClick={closeGallery}
              className="absolute top-1 md:top-3 right-2 md:right-4 text-white hover:text-gray-300 transition-colors z-50 p-2 rounded-full bg-black/50 hover:bg-black/70"
              aria-label="Cerrar galería"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Gallery Header */}
            <div className="text-center mb-4 md:mb-6">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                Actividades de {selectedCareer}
              </h3>
              <p className="text-white/80 text-sm md:text-base">
                Centro Tecnológico de Jalapa - INATEC
              </p>
            </div>

            {/* Gallery Image */}
            <div className="relative rounded-lg overflow-hidden bg-black">
              <div className="h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center">
                <Image
                  src={
                    (careerGalleries[
                      selectedCareer as keyof typeof careerGalleries
                    ] &&
                      careerGalleries[
                        selectedCareer as keyof typeof careerGalleries
                      ][galleryCurrentImage]) ||
                    "/placeholder.svg"
                  }
                  alt={`Actividad de ${selectedCareer} - Imagen ${
                    galleryCurrentImage + 1
                  }`}
                  layout="fill"
                  objectFit="contain"
                  className="h-full w-full"
                />
              </div>

              {/* Gallery Navigation */}
              <button
                onClick={prevGalleryImage}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-all duration-200"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              </button>

              <button
                onClick={nextGalleryImage}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-all duration-200"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs md:text-sm">
                {galleryCurrentImage + 1} de{" "}
                {careerGalleries[selectedCareer as keyof typeof careerGalleries]
                  ?.length || 0}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="flex justify-center gap-2 mt-4 md:mt-6 overflow-x-auto pb-2">
              {careerGalleries[
                selectedCareer as keyof typeof careerGalleries
              ]?.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setGalleryCurrentImage(idx)}
                  className={`relative flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                    idx === galleryCurrentImage
                      ? "ring-2 ring-white scale-110"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`Miniatura ${idx + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}