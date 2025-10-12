"use client";

import { useState, useEffect, useCallback } from "react";
import { useCurrentUser } from "@/hooks/use-current-user"; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Career, Shift } from "@prisma/client";
import Swal from 'sweetalert2';

export default function CareerList() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const session = useCurrentUser(); // Obtener la sesión del usuario
  const isAdmin = session.user?.role === 'ADMIN'; // Comprobar si el usuario es admin

  const shiftBadgeColorMap: Record<Shift, string> = {
    DIURNO: "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200 dark:bg-sky-900 dark:text-sky-200 dark:border-sky-800",
    SABATINO: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800",
    DOMINICAL: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-800",
  };

  const fetchCareers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/careers');
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setCareers(data);
    } catch (error) {
      console.error("Error al cargar carreras:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las carreras.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCareers();
  }, [fetchCareers]);

  const handleToggleActive = async (career: Career) => {
    if (!isAdmin) return;

    const newStatus = !career.active;
    setCareers(currentCareers =>
      currentCareers.map(c =>
        c.id === career.id ? { ...c, active: newStatus } : c
      )
    );

    try {
      const response = await fetch(`/api/careers/${career.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newStatus }),
      });

      if (!response.ok) throw new Error('Error al actualizar el estado');

      toast({
        title: "Éxito",
        description: `La carrera "${career.name}" ha sido ${newStatus ? 'activada' : 'desactivada'}.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error al cambiar estado de la carrera:", error);
      setCareers(currentCareers =>
        currentCareers.map(c =>
          c.id === career.id ? { ...c, active: career.active } : c
        )
      );
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el estado de la carrera.",
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!isAdmin) return;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará la carrera "${name}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/careers/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setCareers(careers.filter(c => c.id !== id));
          Swal.fire('¡Eliminada!', 'La carrera ha sido eliminada.', 'success');
        } else {
          throw new Error('Error en el servidor');
        }
      } catch (error) {
        console.error("Error al eliminar la carrera:", error);
        Swal.fire(
          'Error',
          'No se pudo eliminar la carrera. Es posible que tenga matrículas asociadas.',
          'error'
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span className="text-lg">Cargando carreras...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* VISTA DE TABLA PARA ESCRITORIO */}
      <Table className="hidden md:table">
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="w-[150px]">Turno</TableHead>
            {isAdmin && <TableHead className="w-[150px] text-center">Estado</TableHead>}
            {isAdmin && <TableHead className="w-[100px] text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {careers.map((career) => (
            <TableRow key={career.id}>
              <TableCell className="font-medium">{career.name}</TableCell>
              <TableCell>
                <Badge className={shiftBadgeColorMap[career.shift]}>
                  {career.shift}
                </Badge>
              </TableCell>
              {isAdmin && (
                <>
                  <TableCell className="text-center">
                    <Switch
                      checked={career.active}
                      onCheckedChange={() => handleToggleActive(career)}
                      aria-label={`Activar o desactivar ${career.name}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(career.id, career.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* VISTA DE TARJETAS PARA MÓVILES */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {careers.map((career) => (
          <div key={career.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-base leading-tight pr-2">{career.name}</h3>
              {isAdmin && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => handleDelete(career.id, career.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Turno:</span>
                <Badge className={shiftBadgeColorMap[career.shift]}>
                  {career.shift}
                </Badge>
              </div>
              {isAdmin && (
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-muted-foreground">Estado (Activo):</span>
                  <Switch
                    checked={career.active}
                    onCheckedChange={() => handleToggleActive(career)}
                    aria-label={`Activar o desactivar ${career.name}`}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}