"use client";

import { useState, useEffect, useRef, RefObject } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import ContactSection from "@/components/register/public/contact-section";
import StudentActivities from "@/components/register/public/student-activities";
import StudentRegisterForm from "@/components/register/student-register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import StudentQuestions from "@/components/register/public/student-questions";
import BlurText from "@/components/ui/BlurText";

// --- Helper Hook y Componente para Animación de Scroll ---

/**
 * Hook para detectar si un elemento está visible en la pantalla.
 * @param ref Referencia al elemento a observar.
 * @returns `true` si el elemento está en pantalla, de lo contrario `false`.
 */
function useOnScreen(ref: RefObject<HTMLElement>) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );
    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref]);

  return isIntersecting;
}

/**
 * Componente que envuelve a sus hijos para animarlos al aparecer en pantalla.
 */
const AnimatedSection = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useOnScreen(ref);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-1000 ease-out motion-reduce:transition-none",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      )}
    >
      {children}
    </div>
  );
};

// --- Componente de Tarjeta con Imagen (Sombra por defecto) ---
const StrategyLinkCard = () => {
  return (
    <div className="my-12">
      <Link href="/estrategia-nacional" passHref>
        <div className="
          group block rounded-3xl overflow-hidden transition-all duration-300
          bg-white dark:bg-slate-900/60 dark:backdrop-blur-lg dark:border dark:border-white/10
          shadow-xl hover:shadow-2xl hover:scale-[1.02] cursor-pointer
          lg:flex lg:items-center
        ">
          {/* Contenedor de la Imagen */}
          <div className="relative h-56 lg:h-64 lg:w-5/12">
            <Image
              src="/estrategia-nacional/centro-tecnologico-jalapa-clases-2024.jpg"
              alt="Estudiantes en un entorno profesional"
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Contenido de la tarjeta */}
          <div className="p-6 lg:p-8 lg:w-7/12">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Da el Siguiente Paso: De Técnico a Profesional
            </h3>
            <p className="text-gray-600 dark:text-slate-300 mb-4">
              ¿Sabías que tu título técnico te abre las puertas de la universidad? <br /> Descubre las carreras técnicas que ofrecemos que tienen continuidad. Convalida tus estudios y avanza directamente al segundo o tercer año de una carrera universitaria.
            </p>
            <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold mt-6">
              <span>Conocer más sobre la Continuidad Educativa</span>
              <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};


export default function NewPublicRegisterPage() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  return (
    <div className="max-w-6xl mx-auto pb-2">
      <div>
        {/* Header Section */}
        <div className="text-primary-foreground py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <Image
              src="/logo-inatec-2016.png"
              alt="Logo"
              width={120}
              height={120}
              className="mx-auto mb-5 lg:mb-10 lg:w-60"
            />
            <div className="absolute top-4 right-4 md:top-6 md:right-6">
              <ModeToggle />
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-3 text-balance text-gray-800 dark:text-white">
              CENTRO TECNOLÓGICO DE JALAPA
            </h1>
            <div className="text-xl md:text-3xl font-semibold mb-4 text-yellow-300 max-h-3">
              Matrículas Abiertas 2026
            </div>

            <BlurText
              text="Aprovecha e inscribete pronto, cupos limitados para cada carrera técnica"
              delay={150}
              animateBy="words"
              direction="top"
              className="flex justify-center tex-sm md:text-md lg:text-2xl mt-12 max-w-4xl mx-auto font-medium text-gray-900/50 dark:text-white/70"
            />

            {!isFormVisible && (
              <div className="mt-10">
                <Button
                  size="lg"
                  onClick={toggleFormVisibility}
                  className="animate-bounce"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  ¡Inscríbete Ahora!
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isFormVisible && (
        <div className="relative animate-in fade-in-50 slide-in-from-top-5 duration-700 mt-12 mb-6">
          <Button
            variant="destructive"
            size="icon"
            onClick={toggleFormVisibility}
            className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full h-10 w-10 z-10 shadow-lg hover:scale-110 transition-transform"
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Ocultar formulario</span>
          </Button>
          <Card>
            <CardHeader className="pt-8">
              <div className="text-center">
                <CardTitle className="text-xl md:text-2xl">
                  Registro Público de Estudiante
                </CardTitle>
                <CardDescription>
                  Complete el formulario para registrarse en una carrera
                  técnica.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <StudentRegisterForm />
            </CardContent>
          </Card>
        </div>
      )}

     
      <AnimatedSection>
        <StudentActivities />
      </AnimatedSection>

       <AnimatedSection>
        <StrategyLinkCard />
      </AnimatedSection>


      <AnimatedSection>
        <div className="mb-16">
          <StudentQuestions />
        </div>
        
      </AnimatedSection>

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
  );
}