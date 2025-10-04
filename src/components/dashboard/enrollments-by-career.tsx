'use client';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shift } from '@prisma/client'; // Importar el tipo Shift si está disponible

// Definimos la nueva estructura de los datos que recibirá el componente
interface EnrollmentsByCareerProps {
  data: {
    name: string;
    total: number;
    shift: string; // O Shift si lo importas
  }[];
}

// Objeto para mapear los valores del enum a texto legible
const shiftLabels: { [key: string]: string } = {
  [Shift.DIURNO]: 'Turno Diurno',
  [Shift.SABATINO]: 'Turno Sabatino',
  [Shift.DOMINICAL]: 'Turno Dominical',
};

export default function EnrollmentsByCareer({ data }: EnrollmentsByCareerProps) {
  // Agrupar las carreras por turno
  const groupedByShift = data.reduce((acc, career) => {
    const { shift } = career;
    if (!acc[shift]) {
      acc[shift] = [];
    }
    acc[shift].push(career);
    return acc;
  }, {} as Record<string, typeof data>);

  // Definir el orden deseado de los turnos
  const shiftOrder = [Shift.DIURNO, Shift.SABATINO, Shift.DOMINICAL];

  return (
    <Card>
      <CardContent className='mt-4'>
        <div className="space-y-6">
          {shiftOrder.map(shift => (
            groupedByShift[shift] && (
              <div key={shift}>
                <h4 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b">
                  {shiftLabels[shift] || shift}
                </h4>
                <div className="space-y-4">
                  {groupedByShift[shift].map((career) => (
                    <div
                      key={career.name}
                      className="flex items-center justify-between"
                    >
                      <p className="text-sm text-muted-foreground truncate pr-4">
                        {career.name}
                      </p>
                      <Badge variant="secondary" className="text-base">
                        {career.total}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );
}