// --- Nuevo Componente de Tarjeta con Imagen ---
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const StrategyLinkCard = () => {
  return (
    <div className="my-12">
      <Link href="/estrategia-nacional" passHref>
        <div className="
          group relative block rounded-3xl overflow-hidden transition-all duration-300
          bg-white dark:bg-slate-900/60 dark:backdrop-blur-lg dark:border dark:border-white/10
          hover:shadow-2xl hover:scale-[1.02] cursor-pointer
        ">
          {/* Imagen de fondo */}
          <div className="relative h-56">
            <Image
              src="/estrategia-nacional/tg-administracion.jpg" // Imagen de la carrera de administración
              alt="Estudiantes en un entorno profesional"
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          </div>

          {/* Contenido de la tarjeta */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Da el Siguiente Paso: De Técnico a Profesional
            </h3>
            <p className="text-gray-600 dark:text-slate-300 mb-4">
              ¿Sabías que tu título técnico te abre las puertas de la universidad? Descubre cómo puedes convalidar tus estudios y avanzar directamente al segundo o tercer año de tu carrera universitaria.
            </p>
            <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold">
              <span>Conocer más sobre la Continuidad Educativa</span>
              <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default StrategyLinkCard;