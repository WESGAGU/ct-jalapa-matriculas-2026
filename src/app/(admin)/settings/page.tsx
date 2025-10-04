// src/app/(admin)/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { Form, FormDescription, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';

const settingsSchema = z.object({
  name: z.string()
    .min(1, "El nombre es requerido.")
    .refine(name => !/\s/.test(name), {
      message: "El nombre de usuario no puede contener espacios.",
    }),
  email: z.string().email("El correo no es válido."),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
}).refine(data => {
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    return true;
  }, {
    message: "La contraseña actual es requerida para establecer una nueva.",
    path: ["currentPassword"],
  });


type SettingsFormValues = z.infer<typeof settingsSchema>;

// Definimos un tipo más específico para el usuario que incluye el rol
type UserWithRole = User & { role?: string };


export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    // **THE FIX IS HERE: Initialize all fields to prevent the error**
    defaultValues: {
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
    }
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          // Reset form with fetched data, ensuring passwords are also reset
          form.reset({
            name: userData.name || '',
            email: userData.email || '',
            currentPassword: '',
            newPassword: ''
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [form]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast({ title: "Éxito", description: "Tu perfil ha sido actualizado." });
        router.push('/');
        router.refresh();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar el perfil.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Configuración de la Cuenta</CardTitle>
        <CardDescription>Actualiza tu información personal y contraseña.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Rol</Label>
          <Input value={user?.role || 'No definido'} disabled />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label>Nombre de Usuario</Label>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    No se permiten espacios. Intenta con `wesling.garcia` o `wesling2025`.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label>Correo Electrónico</Label>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <Label>Contraseña Actual</Label>
                  <div className="relative">
                    <FormControl>
                      <Input type={showCurrentPassword ? "text" : "password"} {...field} />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <Label>Nueva Contraseña</Label>
                   <div className="relative">
                    <FormControl>
                     <Input type={showNewPassword ? "text" : "password"} {...field} />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <FormDescription>
                    Deja este campo en blanco si no deseas cambiar tu contraseña.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}