'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface EnrollmentsByAgeProps {
  data: {
    // La propiedad que contiene la etiqueta del eje X ahora es 'age'
    age: number;
    total: number;
  }[];
}

export default function EnrollmentsByAge({ data }: EnrollmentsByAgeProps) {
  return (
    <Card>
      <CardContent className='mt-4'>
        <ChartContainer config={{}} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} accessibilityLayer>
              <XAxis
                // Aquí usamos 'age' para obtener los valores del eje X
                dataKey="age"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Edad', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                label={{ value: 'Cantidad', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Estudiantes"/>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}