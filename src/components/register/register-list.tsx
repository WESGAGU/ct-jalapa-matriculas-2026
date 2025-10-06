"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Eye,
  Download,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  getEnrollments,
  deleteEnrollment,
  getCareers,
  getUsers,
} from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Register } from "@/lib/types";
import { getPendingEnrollments } from "@/lib/storage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Skeleton } from "../ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { EnrollmentPDF } from "./print-sheet-register-estudent";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import Swal from "sweetalert2";
import { Career, Shift } from "@prisma/client";

const EnrollmentActions = ({
  enrollment,
  onDelete,
  onView,
}: {
  enrollment: Register;
  onDelete: (id: string) => void;
  onView: (enrollment: Register) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Abrir menú</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => onView(enrollment)}>
        <Eye className="mr-2 h-4 w-4" /> Ver
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href={`/${enrollment.id}`} className="flex items-center w-full">
          <Edit className="mr-2 h-4 w-4" /> Editar
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => onDelete(enrollment.id)}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" /> Borrar
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default function RegisterList() {
  const [enrollments, setEnrollments] = useState<Register[]>([]);
  const [pendingEnrollments, setPendingEnrollments] = useState<Register[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollmentToView, setEnrollmentToView] = useState<Register | null>(
    null
  );
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const itemsPerPage = 5;

  // Estados para los filtros
  const [searchDate, setSearchDate] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchCareer, setSearchCareer] = useState("");
  const [careers, setCareers] = useState<Career[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string | null }[]>([]);

  const loadAllData = useCallback(
    async (
      page: number,
      filters: { date?: string; user?: string; career?: string } = {}
    ) => {
      setIsLoading(true);

      const apiFilters = {
        date: filters.date || undefined,
        user:
          filters.user === "all" || !filters.user ? undefined : filters.user,
        career:
          filters.career === "all" || !filters.career
            ? undefined
            : filters.career,
      };

      try {
        const [serverData, localData, careersData, usersData] =
          await Promise.all([
            getEnrollments(page, itemsPerPage, apiFilters),
            getPendingEnrollments(),
            getCareers(),
            getUsers(),
          ]);
        setEnrollments(serverData.enrollments as Register[]);
        setTotalEnrollments(serverData.total);
        setPendingEnrollments(localData);
        setCareers(careersData);
        setUsers(usersData);
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las matrículas",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    setIsClient(true);
    // La carga inicial se maneja con el botón de búsqueda para evitar cargas múltiples
  }, []);

  useEffect(() => {
    const handleStorageChange = () =>
      loadAllData(currentPage, {
        date: searchDate,
        user: searchUser,
        career: searchCareer,
      });
    window.addEventListener("storageUpdated", handleStorageChange);
    return () =>
      window.removeEventListener("storageUpdated", handleStorageChange);
  }, [loadAllData, currentPage, searchDate, searchUser, searchCareer]);

  useEffect(() => {
    // Cargar datos cuando la página o los filtros cambian
    if (isClient) {
      loadAllData(currentPage, {
        date: searchDate,
        user: searchUser,
        career: searchCareer,
      });
    }
  }, [currentPage, isClient]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "¿Está seguro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteEnrollment(id);
      await loadAllData(currentPage, {
        date: searchDate,
        user: searchUser,
        career: searchCareer,
      });

      Swal.fire({
        title: "¡Eliminado!",
        text: "La matrícula ha sido eliminada correctamente",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    } catch {
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar la matrícula",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadAllData(1, {
      date: searchDate,
      user: searchUser,
      career: searchCareer,
    });
  };

  const clearFilters = () => {
    setSearchDate("");
    setSearchUser("");
    setSearchCareer("");
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadAllData(1, {});
    }
  };

  const allEnrollments = useMemo(() => {
    // La lógica de filtrado ahora se maneja principalmente en el backend
    // El frontend solo combina los resultados
    return [...pendingEnrollments, ...enrollments];
  }, [pendingEnrollments, enrollments]);

  const groupedCareers = useMemo(
    () =>
      careers.reduce((acc, career) => {
        const shift = career.shift;
        if (!acc[shift]) {
          acc[shift] = [];
        }
        acc[shift].push(career);
        return acc;
      }, {} as Record<string, Career[]>),
    [careers]
  );

  const shiftOrder: Shift[] = [Shift.DIURNO, Shift.SABATINO, Shift.DOMINICAL];

  const totalPages = Math.ceil(totalEnrollments / itemsPerPage);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (isLoading && !isClient) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              type="date"
              placeholder="Fecha de registro"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
            <Select value={searchUser} onValueChange={setSearchUser}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                {users
                  .filter((user) => user.name)
                  .map((user) => (
                    <SelectItem key={user.id} value={user.name!}>
                      {user.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={searchCareer} onValueChange={setSearchCareer}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por carrera" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las carreras</SelectItem>
                <SelectSeparator />
                {shiftOrder.map((shift) => {
                  const careerList = groupedCareers[shift];
                  if (!careerList || careerList.length === 0) return null;

                  return (
                    <SelectGroup key={shift}>
                      <SelectLabel>
                        {shift.charAt(0).toUpperCase() +
                          shift.slice(1).toLowerCase()}
                      </SelectLabel>
                      {careerList.map((career) => (
                        <SelectItem key={career.id} value={career.name}>
                          {career.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="w-full">
                <Search className="mr-2 h-4 w-4" /> Buscar
              </Button>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" /> Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Matrículas Registradas ({totalEnrollments})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(itemsPerPage)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Carrera</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead>Registrado por</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
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
                      <TableCell className="text-right">
                        <EnrollmentActions
                          enrollment={enrollment}
                          onDelete={handleDelete}
                          onView={setEnrollmentToView}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || isLoading}
              >
                Anterior
              </Button>
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || isLoading}
              >
                Siguiente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="md:hidden space-y-4">
        <h2 className="text-xl font-bold">
          Matrículas Registradas ({totalEnrollments})
        </h2>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : (
          allEnrollments.map((enrollment) => (
            <Card key={enrollment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">
                    {enrollment.nombres} {enrollment.apellidos}
                  </CardTitle>
                  <EnrollmentActions
                    enrollment={enrollment}
                    onDelete={handleDelete}
                    onView={setEnrollmentToView}
                  />
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
          ))
        )}
        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || isLoading}
          >
            Anterior
          </Button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || isLoading}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <Dialog
        open={!!enrollmentToView}
        onOpenChange={(open) => !open && setEnrollmentToView(null)}
      >
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Previsualización de Matrícula</DialogTitle>
            <DialogDescription>
              Vista previa de la hoja de matrícula de{" "}
              {enrollmentToView?.nombres}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-md my-4">
            {isClient && enrollmentToView && (
              <PDFViewer style={{ width: "100%", height: "100%" }}>
                <EnrollmentPDF enrollment={enrollmentToView} />
              </PDFViewer>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollmentToView(null)}>
              Cerrar
            </Button>
            {isClient && enrollmentToView && (
              <PDFDownloadLink
                document={<EnrollmentPDF enrollment={enrollmentToView} />}
                fileName={`Matricula-${enrollmentToView.nombres}-${enrollmentToView.apellidos}.pdf`}
              >
                {({ loading }) => (
                  <Button disabled={loading}>
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? "Generando..." : "Descargar PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
