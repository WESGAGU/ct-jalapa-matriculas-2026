'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
// El hook useToast ha sido eliminado

export default function ShareLinkCard() {
  const [hasCopied, setHasCopied] = useState(false);
  
  const link = "https://ct-jalapa-matriculas-2026.vercel.app/public-register";

  const copyToClipboard = () => {
    // navigator.clipboard solo está disponible en contextos seguros (HTTPS)
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        setHasCopied(true);
        // La notificación toast ha sido eliminada
        setTimeout(() => setHasCopied(false), 2000); // Resetea el ícono después de 2 segundos
      }, (err) => {
        console.error('Error al copiar el enlace: ', err);
        // La notificación toast de error también ha sido eliminada
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          Copia y comparte este enlace para que los estudiantes puedan matricularse en línea.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* --- CONTENEDOR RESPONSIVO --- */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Input
            value={link}
            readOnly
            className="flex-1 w-full"
          />
          <Button onClick={copyToClipboard} className="w-full sm:w-auto">
            {hasCopied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {hasCopied ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}