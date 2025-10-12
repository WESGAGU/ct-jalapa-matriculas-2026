"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { GraduationCap, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(undefined);

    const formData = new FormData(event.currentTarget);
    const login = formData.get('login') as string;
    const password = formData.get('password') as string;

    try {
      // Llamamos a nuestra nueva API de login
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      if (!response.ok) {
        // Si la respuesta no es exitosa, mostramos un error
        const data = await response.json();
        setErrorMessage(data.error || 'Credenciales inválidas. Intente de nuevo.');
      } else {
        // Si es exitosa, redirigimos al dashboard
        router.push('/');
        router.refresh(); // Importante para que el servidor reconozca la nueva sesión
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Algo salió mal. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full w-fit">
                <GraduationCap className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl mt-4">CT JALAPA</CardTitle>
            <CardDescription>Inicia sesión para acceder al panel</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="login">Usuario o Correo Electrónico</Label>
                    <Input
                        id="login"
                        name="login"
                        type="text"
                        placeholder="usuario o tu@correo.com"
                        required
                        disabled={isSubmitting}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      required 
                      disabled={isSubmitting}
                    />
                </div>
                <Button className="w-full" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
                {errorMessage && (
                  <div className="flex items-center space-x-2 text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-200">
                      <AlertTriangle className="h-4 w-4" />
                      <p>{errorMessage}</p>
                  </div>
                )}
            </form>
        </CardContent>
    </Card>
  );
}