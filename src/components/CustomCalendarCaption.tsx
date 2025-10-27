"use client";

import React, { useState } from 'react';
import { CaptionProps, useNavigation } from 'react-day-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const CustomCalendarCaption: React.FC<CaptionProps> = (props) => {
  const { goToMonth, nextMonth, previousMonth } = useNavigation();
  const { displayMonth } = props;

  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  const handleYearClick = () => {
    setIsYearPickerOpen(!isYearPickerOpen);
  };

  const handleYearChange = (yearOffset: number) => {
    const newDate = new Date(displayMonth.getFullYear() + yearOffset, displayMonth.getMonth(), 1);
    goToMonth(newDate);
    // Não fecha o picker imediatamente, permite múltiplos cliques
  };

  return (
    <div className="flex items-center justify-between px-2 py-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => previousMonth && goToMonth(previousMonth)}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center relative">
        <span className="text-sm font-medium mr-1">
          {format(displayMonth, 'MMMM', { locale: ptBR })}
        </span>
        <span
          className="text-sm font-medium cursor-pointer hover:text-primary transition-colors"
          onClick={handleYearClick}
        >
          {format(displayMonth, 'yyyy')}
        </span>
        {isYearPickerOpen && (
          <div className="absolute z-50 bg-popover border rounded-md shadow-lg p-1 flex flex-col space-y-1 top-full left-1/2 -translate-x-1/2 mt-1">
            <Button size="sm" variant="ghost" onClick={() => handleYearChange(1)} className="h-7 w-7 p-0">
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleYearChange(-1)} className="h-7 w-7 p-0">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => nextMonth && goToMonth(nextMonth)}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CustomCalendarCaption;