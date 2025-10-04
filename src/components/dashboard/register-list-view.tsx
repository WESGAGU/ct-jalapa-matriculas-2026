"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getEnrollments } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Register } from "@/lib/types";
import { getPendingEnrollments } from "@/lib/storage";
import { Skeleton } from "../ui/skeleton";

export default function RegisterListView() {
  const [enrollments, setEnrollments] = useState<Register[]>([]);
  const [pendingEnrollments, setPendingEnrollments] = useState<Register[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [serverData, localData] = await Promise.all([
        getEnrollments(),
        getPendingEnrollments(),
      ]);
      setEnrollments(serverData as Register[]);
      setPendingEnrollments(localData);
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las matrículas",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAllData();
    window.addEventListener("storageUpdated", loadAllData);
    return () => window.removeEventListener("storageUpdated", loadAllData);
  }, [loadAllData]);

  const allEnrollments = [...pendingEnrollments, ...enrollments].slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="hidden md:block">
        <Card>
          <CardContent className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Carrera</TableHead>
                  <TableHead>Fecha de Registro</TableHead>
                  <TableHead>Registrado por</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">
                      {enrollment.nombres} {enrollment.apellidos}
                    </TableCell>
                    <TableCell>{enrollment.carreraTecnica}</TableCell>
                    <TableCell>
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {enrollment.user?.name || "Estudiante en Línea"}
                    </TableCell>
                    <TableCell>
                      {pendingEnrollments.some(
                        (p) => p.id === enrollment.id
                      ) ? (
                        <Badge
                          variant="outline"
                          className="bg-yellow-100 text-yellow-800 border-yellow-300"
                        >
                          Pendiente
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 border-green-300"
                        >
                          Completado
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="md:hidden space-y-4">
        {allEnrollments.map((enrollment) => (
          <Card key={enrollment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">
                  {enrollment.nombres} {enrollment.apellidos}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between text-left">
                <span className="text-muted-foreground">Carrera:</span>
                <span className="text-right font-medium">
                  {enrollment.carreraTecnica}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha:</span>
                <span>
                  {new Date(enrollment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registrado por:</span>
                <span>{enrollment.user?.name || "Estudiante en Línea"}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">Estado:</span>
                {pendingEnrollments.some((p) => p.id === enrollment.id) ? (
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 text-yellow-800 border-yellow-300"
                  >
                    Pendiente
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 border-green-300"
                  >
                    Completado
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}