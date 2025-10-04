'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, Download, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { getEnrollments, deleteEnrollment } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Register } from '@/lib/types';
import { getPendingEnrollments } from '@/lib/storage';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { EnrollmentPDF } from './print-sheet-register-estudent';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import Swal from 'sweetalert2';

const EnrollmentActions = ({ enrollment, onDelete, onView }: { enrollment: Register, onDelete: (id: string) => void, onView: (enrollment: Register) => void }) => (
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
            <DropdownMenuItem onClick={() => onDelete(enrollment.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Borrar
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);

export default function RegisterList() {
    const [enrollments, setEnrollments] = useState<Register[]>([]);
    const [pendingEnrollments, setPendingEnrollments] = useState<Register[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [enrollmentToView, setEnrollmentToView] = useState<Register | null>(null);
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalEnrollments, setTotalEnrollments] = useState(0);
    const itemsPerPage = 5;

    const loadAllData = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            const [serverData, localData] = await Promise.all([
                getEnrollments(page, itemsPerPage),
                getPendingEnrollments()
            ]);
            setEnrollments(serverData.enrollments as Register[]);
            setTotalEnrollments(serverData.total);
            setPendingEnrollments(localData);
        } catch {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudieron cargar las matrículas',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        setIsClient(true);
        loadAllData(currentPage);
        const handleStorageChange = () => loadAllData(currentPage);
        window.addEventListener('storageUpdated', handleStorageChange);
        return () => window.removeEventListener('storageUpdated', handleStorageChange);
    }, [loadAllData, currentPage]);

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Está seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            await deleteEnrollment(id);
            await loadAllData(currentPage);

            Swal.fire({
                title: '¡Eliminado!',
                text: 'La matrícula ha sido eliminada correctamente',
                icon: 'success',
                confirmButtonColor: '#3085d6'
            });
        } catch {
            Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar la matrícula',
                icon: 'error',
                confirmButtonColor: '#3085d6'
            });
        }
    };
    
    const allEnrollments = [...pendingEnrollments, ...enrollments];
    const totalPages = Math.ceil(totalEnrollments / itemsPerPage);

    const handlePreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };


    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="hidden md:block">
                <Card>
                    <CardHeader>
                        <CardTitle>Matrículas Registradas ({totalEnrollments})</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                                        <TableCell className="font-medium">{enrollment.nombres} {enrollment.apellidos}</TableCell>
                                        <TableCell>{enrollment.carreraTecnica}</TableCell>
                                        <TableCell>{new Date(enrollment.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{enrollment.user?.name || 'Estudiante en Línea'}</TableCell>
                                        <TableCell>
                                            {pendingEnrollments.some(p => p.id === enrollment.id) ? (
                                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendiente</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Completado</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <EnrollmentActions enrollment={enrollment} onDelete={handleDelete} onView={setEnrollmentToView} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <div className="flex justify-between items-center mt-4">
                            <Button onClick={handlePreviousPage} disabled={currentPage === 1}>Anterior</Button>
                            <span>Página {currentPage} de {totalPages}</span>
                            <Button onClick={handleNextPage} disabled={currentPage === totalPages}>Siguiente</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="md:hidden space-y-4">
                <h2 className="text-xl font-bold">Matrículas Registradas ({totalEnrollments})</h2>
                {allEnrollments.map((enrollment) => (
                    <Card key={enrollment.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-base">{enrollment.nombres} {enrollment.apellidos}</CardTitle>
                                <EnrollmentActions enrollment={enrollment} onDelete={handleDelete} onView={setEnrollmentToView} />
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between text-left"><span className="text-muted-foreground">Carrera:</span><span className="text-right font-medium">{enrollment.carreraTecnica}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Fecha:</span><span>{new Date(enrollment.createdAt).toLocaleDateString()}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Registrado por:</span><span>{enrollment.user?.name || 'Estudiante en Línea'}</span></div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-muted-foreground">Estado:</span>
                                {pendingEnrollments.some(p => p.id === enrollment.id) ? (
                                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendiente</Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Completado</Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                 <div className="flex justify-between items-center mt-4">
                    <Button onClick={handlePreviousPage} disabled={currentPage === 1}>Anterior</Button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <Button onClick={handleNextPage} disabled={currentPage === totalPages}>Siguiente</Button>
                </div>
            </div>

            <Dialog open={!!enrollmentToView} onOpenChange={(open) => !open && setEnrollmentToView(null)}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Previsualización de Matrícula</DialogTitle>
                        <DialogDescription>
                            Vista previa de la hoja de matrícula de {enrollmentToView?.nombres}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto border rounded-md my-4">
                        {isClient && enrollmentToView && (
                            <PDFViewer style={{ width: '100%', height: '100%' }}>
                                <EnrollmentPDF enrollment={enrollmentToView} />
                            </PDFViewer>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEnrollmentToView(null)}>Cerrar</Button>
                        {isClient && enrollmentToView && (
                            <PDFDownloadLink
                                document={<EnrollmentPDF enrollment={enrollmentToView} />}
                                fileName={`Matricula-${enrollmentToView.nombres}-${enrollmentToView.apellidos}.pdf`}
                            >
                                {({ loading }) => (
                                    <Button disabled={loading}>
                                        <Download className="mr-2 h-4 w-4" />
                                        {loading ? 'Generando...' : 'Descargar PDF'}
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