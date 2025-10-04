'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EnrollmentsByAcademicLevelProps {
  data: {
    name: string;
    total: number;
  }[];
}

export default function EnrollmentsByAcademicLevel({ data }: EnrollmentsByAcademicLevelProps) {
  return (
    <Card>
      <CardContent className='mt-4'>
        <div className="gap-y-4 space-y-10 max-h-96 overflow-y-auto">
          {data.map((level) => (
            <div
              key={level.name}
              className="flex items-center justify-between pb-2 border-b last:border-b-0 last:pb-0"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {level.name}
              </p>
              <Badge variant="secondary" className="text-base">
                {level.total}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
