"use client"

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarProps {
  date: Date | undefined;
  setDate: (date: Date) => void;
  setIsOpen?: (isOpen: boolean) => void;
}

export function Calendar({ date, setDate, setIsOpen }: CalendarProps) {
  const [currentMonthDate, setCurrentMonthDate] = useState(date || new Date());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 101 }, (_, i) => currentYear - 80 + i);

  const months = Array.from({ length: 12 }, (_, i) => {
    return format(new Date(2000, i), 'MMMM', { locale: es });
  });

  const weekdays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  const changeMonth = (amount: number) => {
    setCurrentMonthDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setCurrentMonthDate(prev => new Date(newYear, prev.getMonth()));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    setCurrentMonthDate(prev => new Date(prev.getFullYear(), newMonth));
  };

  const handleDateSelect = (day: Date) => {
    setDate(day);
    if (setIsOpen) setIsOpen(false);
  };

  const startOfMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const daysInGrid = [];
  const dayIterator = startDate;
  for (let i = 0; i < 42; i++) {
    daysInGrid.push(new Date(dayIterator));
    dayIterator.setDate(dayIterator.getDate() + 1);
  }

  const today = new Date();

  return (
    <div className="p-3 bg-card border rounded-md shadow-lg w-auto">
      <div className="flex justify-between items-center mb-3">
        <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-md hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4" /></button>
        <div className="flex items-center gap-2">
          <select
            value={currentMonthDate.getMonth()}
            onChange={handleMonthChange}
            className="text-sm font-semibold bg-card border border-input rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month.charAt(0).toUpperCase() + month.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={currentMonthDate.getFullYear()}
            onChange={handleYearChange}
            className="text-sm font-semibold bg-card border border-input rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
          >
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
        <button onClick={() => changeMonth(1)} className="p-1.5 rounded-md hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4" /></button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map(wd => <div key={wd} className="text-xs font-medium text-muted-foreground w-9 h-9 flex items-center justify-center">{wd}</div>)}
        
        {daysInGrid.map((d, i) => {
          const isCurrentMonth = d.getMonth() === currentMonthDate.getMonth();
          const isSelectedDay = isSameDay(d, date as Date);
          const isToday = isSameDay(d, today);

          return (
            <button
              key={i}
              onClick={() => handleDateSelect(d)}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-md text-sm transition-colors cursor-pointer",
                isCurrentMonth ? "text-foreground" : "text-muted-foreground",
                isCurrentMonth && !isSelectedDay && "hover:bg-muted",
                isSelectedDay && "bg-primary text-primary-foreground hover:bg-primary/90",
                isToday && !isSelectedDay && "bg-accent text-accent-foreground"
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}