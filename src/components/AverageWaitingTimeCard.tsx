"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const AverageWaitingTimeCard: React.FC = () => {
  // Valor mock para a média de tempo de espera (ex: 1 hora e 15 minutos)
  const mockAverageSeconds = 4500; // 1 hora = 3600s, 15 minutos = 900s

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .join(":");
  };

  return (
    <Card className={cn("bg-yellow-600 text-white shadow-md")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Média de Tempo de Espera</CardTitle>
        <Clock className="h-4 w-4 text-white" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatTime(mockAverageSeconds)}</div>
        <p className="text-white/80 text-xs">Para consultas em espera</p>
      </CardContent>
    </Card>
  );
};

export default AverageWaitingTimeCard;