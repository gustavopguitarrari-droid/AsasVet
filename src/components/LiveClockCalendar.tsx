"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

const LiveClockCalendar: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Atualiza a cada segundo

    return () => {
      clearInterval(timer); // Limpa o intervalo ao desmontar o componente
    };
  }, []);

  const formattedDate = format(currentDateTime, "dd/MM/yyyy", { locale: ptBR });
  const formattedTime = format(currentDateTime, "HH:mm:ss", { locale: ptBR });

  return (
    <div className={cn(
      "flex items-center space-x-2 text-sm font-medium text-muted-foreground",
      "bg-muted/50 px-3 py-1.5 rounded-lg shadow-sm" // Adicionado rounded-lg
    )}>
      <CalendarDays className="h-4 w-4" />
      <span>{formattedDate}</span>
      <Clock className="h-4 w-4 ml-2" />
      <span>{formattedTime}</span>
    </div>
  );
};

export default LiveClockCalendar;