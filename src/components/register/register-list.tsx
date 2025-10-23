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
  X,
  Loader2,
  FileText,
} from "lucide-react";
import Link from "next/link";
import {
  getEnrollments,
  deleteEnrollment,
  getCareers,
  getUsers,
} from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Register, User } from "@/lib/types";
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
import { PDFViewer, PDFDownloadLink, pdf } from "@react-pdf/renderer";
import Swal from "sweetalert2";
import { Career, Shift } from "@prisma/client";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- HOOK PARA DETECTAR MÓVIL (SIN CAMBIOS) ---
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkDevice = () => {
        const isMobileDevice =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );
        setIsMobile(isMobileDevice);
      };
      checkDevice();
      window.addEventListener("resize", checkDevice);
      return () => window.removeEventListener("resize", checkDevice);
    }
  }, []);

  return isMobile;
}

// --- HOOK PARA DEBOUNCE (SIN CAMBIOS) ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Define un tipo más completo para el usuario, incluyendo el rol (SIN CAMBIOS)
type UserWithRole = User & {
  role?: string;
  id?: string;
};

// --- COMPONENTE MEJORADO PARA INDICADORES DE DOCUMENTOS (SIN CAMBIOS) ---
const DocumentStatus = ({ enrollment }: { enrollment: Register }) => {
  const presentDocs = [];
  if (enrollment.cedulaFileFrente) presentDocs.push("Cédula (Frente)");
  if (enrollment.cedulaFileReverso) presentDocs.push("Cédula (Reverso)");
  if (enrollment.birthCertificateFile) presentDocs.push("Cert. Nacimiento");
  if (enrollment.diplomaFile) presentDocs.push("Diploma");
  if (enrollment.gradesCertificateFile) presentDocs.push("Cert. de Notas");

  if (presentDocs.length === 0) {
    return <Badge variant="secondary">Sin documentos</Badge>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className="flex items-center cursor-default border-blue-300 bg-blue-50 text-blue-800">
            <FileText className="h-4 w-4 mr-1" />
            {presentDocs.length} documento(s)
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Documentos presentes:</p>
          <ul className="list-disc list-inside">
            {presentDocs.map((doc) => (
              <li key={doc}>{doc}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const EnrollmentActions = ({
  enrollment,
  onDelete,
  onView,
  currentUser,
  isViewing,
}: {
  enrollment: Register;
  onDelete: (id: string) => void;
  onView: (enrollment: Register) => void;
  currentUser: UserWithRole | null;
  isViewing: boolean;
}) => {
  const isAdmin = currentUser?.role === "ADMIN";
  const isOwner = currentUser?.id === enrollment.userId;
  const canEditDelete = isAdmin || isOwner;
  const canManageUnassigned = isAdmin && enrollment.userId === null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isViewing}>
          {isViewing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onView(enrollment)}
          disabled={isViewing}
        >
          {isViewing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Eye className="mr-2 h-4 w-4" />
          )}
          Ver
        </DropdownMenuItem>

        {(canEditDelete || canManageUnassigned) && (
          <>
            <DropdownMenuItem asChild>
              <Link
                href={`/${enrollment.id}`}
                className="flex items-center w-full"
              >
                <Edit className="mr-2 h-4 w-4" /> Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(enrollment.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Borrar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function RegisterList() {
  const { user: currentUser, isLoading: isUserLoading } = useCurrentUser();
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

  const isMobile = useIsMobile();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);

  // Estados para filtros
  const [searchDate, setSearchDate] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchCareer, setSearchCareer] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchDocumentFilter, setSearchDocumentFilter] = useState("all");
  // Se eliminó searchShift y sus referencias
  const [careers, setCareers] = useState<Career[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string | null }[]>([]);

  // Debounce para búsqueda automática
  const debouncedSearchName = useDebounce(searchName, 500);
  const debouncedSearchDate = useDebounce(searchDate, 500);
  const debouncedSearchUser = useDebounce(searchUser, 500);
  const debouncedSearchCareer = useDebounce(searchCareer, 500);
  const debouncedSearchDocumentFilter = useDebounce(searchDocumentFilter, 500);

  const loadAllData = useCallback(
    async (
      page: number,
      filters: { 
        date?: string; 
        user?: string; 
        career?: string;
        name?: string;
        documentFilter?: string;
      } = {}
    ) => {
      setIsLoading(true);
      const apiFilters = {
        date: filters.date || undefined,
        user:
          filters.user === "all" || !filters.user
            ? undefined
            : filters.user === "PUBLIC_USER" // Lógica para el filtro Público
            ? "PUBLIC_USER"
            : filters.user,
        career:
          filters.career === "all" || !filters.career
            ? undefined
            : filters.career,
        name: filters.name || undefined,
        documentFilter: filters.documentFilter === "all" ? undefined : filters.documentFilter,
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
  }, []);

  // Efecto para búsqueda automática con debounce
  useEffect(() => {
    if (isClient) {
      loadAllData(currentPage, {
        date: debouncedSearchDate,
        user: debouncedSearchUser,
        career: debouncedSearchCareer,
        name: debouncedSearchName,
        documentFilter: debouncedSearchDocumentFilter,
      });
    }
  }, [
    currentPage,
    isClient,
    debouncedSearchDate,
    debouncedSearchUser,
    debouncedSearchCareer,
    debouncedSearchName,
    debouncedSearchDocumentFilter,
    loadAllData,
  ]);

  useEffect(() => {
    const handleStorageChange = () =>
      loadAllData(currentPage, {
        date: searchDate,
        user: searchUser,
        career: searchCareer,
        name: searchName,
        documentFilter: searchDocumentFilter,
      });
    window.addEventListener("storageUpdated", handleStorageChange);
    return () =>
      window.removeEventListener("storageUpdated", handleStorageChange);
  }, [loadAllData, currentPage, searchDate, searchUser, searchCareer, searchName, searchDocumentFilter]);

  const handleView = async (enrollment: Register) => {
    if (isMobile) {
      setIsGeneratingPdf(enrollment.id);
      try {
        const blob = await pdf(
          <EnrollmentPDF enrollment={enrollment} />
        ).toBlob();
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (error) {
        console.error("Error al generar PDF en móvil:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo generar la vista previa del PDF.",
        });
      } finally {
        setIsGeneratingPdf(null);
      }
    } else {
      setEnrollmentToView(enrollment);
    }
  };

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
        name: searchName,
        documentFilter: searchDocumentFilter,
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

  const clearFilters = () => {
    setSearchDate("");
    setSearchUser("");
    setSearchCareer("");
    setSearchName("");
    setSearchDocumentFilter("all");
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadAllData(1, {});
    }
  };

  const allEnrollments = useMemo(() => {
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

  if ((isLoading && !isClient) || isUserLoading) {
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
            
            <Input
              placeholder="Buscar por nombre o apellido"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            
            <Select value={searchUser} onValueChange={setSearchUser}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                <SelectItem value="PUBLIC_USER">Público (Sin asignar)</SelectItem>
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

            <Select value={searchDocumentFilter} onValueChange={setSearchDocumentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por documentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los documentos</SelectItem>
                <SelectItem value="without">Sin documentos</SelectItem>
                <SelectItem value="with">Con documentos</SelectItem>
                <SelectItem value="complete">Documentos completos</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" /> Limpiar filtros
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
                    {/* CORRECCIÓN HIDRATACIÓN: Contenido de TR en una línea */}
                    <TableHead>Estudiante</TableHead><TableHead>Carrera</TableHead><TableHead>Turno</TableHead><TableHead>Fecha de Registro</TableHead><TableHead>Registrado por</TableHead><TableHead className="w-48">Documentos</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      {/* CORRECCIÓN HIDRATACIÓN: Contenido de TR en una línea */}
                      <TableCell className="font-medium">
                        {enrollment.nombres} {enrollment.apellidos}
                      </TableCell><TableCell>{enrollment.carreraTecnica}</TableCell><TableCell>
                        {enrollment.career?.shift || "N/A"}
                      </TableCell><TableCell>
                        {new Date(enrollment.createdAt).toLocaleDateString()}
                      </TableCell><TableCell>
                        {enrollment.user?.name || "Público"}
                      </TableCell><TableCell>
                        <DocumentStatus enrollment={enrollment} />
                      </TableCell><TableCell>
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
                      </TableCell><TableCell className="text-right">
                        <EnrollmentActions
                          enrollment={enrollment}
                          onDelete={handleDelete}
                          onView={handleView}
                          currentUser={currentUser}
                          isViewing={isGeneratingPdf === enrollment.id}
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
                    onView={handleView}
                    currentUser={currentUser}
                    isViewing={isGeneratingPdf === enrollment.id}
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
                <div className="flex justify-between text-left">
                  <span className="text-muted-foreground">Turno:</span>
                  <span className="text-right font-medium">
                    {enrollment.career?.shift || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha:</span>
                  <span>
                    {new Date(enrollment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Registrado por:
                  </span>
                  <span>{enrollment.user?.name || "Público"}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted-foreground">Docs:</span>
                  <DocumentStatus enrollment={enrollment} />
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
            <Button
              variant="outline"
              onClick={() => setEnrollmentToView(null)}
            >
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