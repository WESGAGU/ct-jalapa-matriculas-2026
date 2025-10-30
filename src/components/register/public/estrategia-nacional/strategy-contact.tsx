
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { MdSchool } from "react-icons/md"; // Importamos un ícono relevante

export default function CtaSection() {
  return (
    <motion.div
      // Usamos whileInView para que se anime al hacer scroll
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: false, amount: 0.3 }}
      className="
        w-full max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-xl
        bg-gradient-to-r from-blue-600 to-cyan-500 
        dark:from-blue-500 dark:to-cyan-400
        p-8 sm:p-12 text-center
      "
    >
      {/* Título principal */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        viewport={{ once: false }}
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
      >
        ¿Qué esperas? ¡Matricúlate ya!
      </motion.h2>

      {/* Subtítulo */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        viewport={{ once: false }}
        className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto font-light"
      >
        No desaproveches esta oportunidad
      </motion.p>

      {/* Botón de Matrícula */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 100 }}
        viewport={{ once: false }}
      >
        <Link
          href="https://ct-jalapa-matriculas-2026.vercel.app/public-register"
          rel="noopener noreferrer"
          className="
            inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 
            rounded-full bg-white text-blue-600 font-semibold 
            shadow-lg hover:shadow-xl hover:scale-105 
            transition-all duration-300 text-base sm:text-lg
          "
        >
          <MdSchool className="w-5 h-5 sm:w-6 sm:h-6" />
          Matricularme Ahora
        </Link>
      </motion.div>
    </motion.div>
  );
}