'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form";
import { useRouter, useParams } from 'next/navigation';
import { User } from '@prisma/client';
import { withAdminAuth } from '@/components/auth/withAdminAuth'; // 1. Importa el HOC

const userFormSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres.").optional(),
  email: z.string().email("Debe ser un correo electrónico válido.").optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional().or(z.literal('')),
  role: z.enum(['USER', 'ADMIN']),
});

type UserFormValues = z.infer<typeof userFormSchema>;

function EditUserPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<User | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
  });

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const response = await fetch(`/api/users/${id}`);
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            form.reset({
              name: userData.name || '',
              email: userData.email || '',
              role: userData.role,
              password: '',
            });
          } else {
             router.push('/users');
          }
        } catch (error) {
           console.error(error)
        }
      };
      fetchUser();
    }
  }, [id, form, router, toast]);

  const onSubmit = async (data: UserFormValues) => {
    
    const submissionData: Partial<UserFormValues> = { ...data };

    if (!submissionData.password) {
      delete submissionData.password;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Usuario Actualizado",
          description: `El usuario ${result.name} ha sido actualizado.`,
          variant: "success"
        });
        router.push('/users');
        router.refresh();
      } else {
        toast({
          title: "Error al actualizar",
          description: result.error || "Ocurrió un error inesperado.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error de Red",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Editar Usuario</CardTitle>
        <CardDescription>
          Modifique los datos del usuario. Deje la contraseña en blanco para no cambiarla.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="ej. juanperez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ejemplo@correo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Dejar en blanco para no cambiar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USER">Usuario</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push('/users')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// 2. Envuelve el componente en el HOC antes de exportarlo
export default withAdminAuth(EditUserPage);
