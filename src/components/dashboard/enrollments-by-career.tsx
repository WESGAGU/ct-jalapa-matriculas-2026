'use client';

import { Badge } from '@/components/ui/badge';
import { Shift } from '@prisma/client';

interface EnrollmentsByCareerProps {
  data: {
    name: string;
    total: number;
    shift: string;
  }[];
}

const shiftLabels: { [key: string]: string } = {
  [Shift.DIURNO]: 'Turno Diurno',
  [Shift.SABATINO]: 'Turno Sabatino',
  [Shift.DOMINICAL]: 'Turno Dominical',
};

export default function EnrollmentsByCareer({ data }: EnrollmentsByCareerProps) {
  const groupedByShift = data.reduce((acc, career) => {
    const { shift } = career;
    if (!acc[shift]) {
      acc[shift] = [];
    }
    acc[shift].push(career);
    return acc;
  }, {} as Record<string, typeof data>);

  const shiftOrder = [Shift.DIURNO, Shift.SABATINO, Shift.DOMINICAL];

  return (
    <div className="space-y-6">
      {shiftOrder.map(shift => (
        groupedByShift[shift] && (
          <div key={shift}>
            <h4 className="text-sm font-semibold text-foreground mb-3 pb-2 border-b">
              {shiftLabels[shift] || shift}
            </h4>
            <div className="space-y-4 pr-4"> {/* Contenedor de carreras sin scroll propio */}
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
  );
}