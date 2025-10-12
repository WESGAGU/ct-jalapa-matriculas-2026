"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Shift } from "@prisma/client";

const careerFormSchema = z.object({
  name: z.string().min(3, "El nombre es requerido y debe tener al menos 3 caracteres."),
  shift: z.nativeEnum(Shift, {
    errorMap: () => ({ message: "Por favor, seleccione un turno válido." }),
  }),
});

type CareerFormValues = z.infer<typeof careerFormSchema>;

export default function CareerForm() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<CareerFormValues>({
    resolver: zodResolver(careerFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: CareerFormValues) => {
    try {
      const response = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Carrera Creada",
          description: `La carrera "${result.name}" ha sido creada exitosamente.`,
          variant: "success",
        });
        router.push('/careers');
        router.refresh();
      } else {
        toast({
          title: "Error al crear",
          description: result.error || "Ocurrió un error inesperado.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // CORRECCIÓN: Añadido console.error para usar la variable 'error'.
      console.error("Error al crear la carrera:", error);
      toast({
        title: "Error de Red",
        description: "No se pudo conectar con el servidor.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Carrera</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Técnico General en Computación" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="shift"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turno</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un turno" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DIURNO">Diurno</SelectItem>
                  <SelectItem value="SABATINO">Sabatino</SelectItem>
                  <SelectItem value="DOMINICAL">Dominical</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Carrera
            </Button>
        </div>
      </form>
    </Form>
  );
}