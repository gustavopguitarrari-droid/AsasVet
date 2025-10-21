"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react"; // Usando Timer para diferenciar do Clock
import { cn } from "@/lib/utils";

const AverageConsultationTimeCard: React.FC = () => {
  // Valor mock para a média de tempo da consulta (ex: 25 minutos e 30 segundos)
  const mockAverageSeconds = 1530; // 25 minutos = 1500s, 30 segundos = 30s

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Se houver horas, inclua-as, caso contrário, mostre apenas minutos e segundos
    if (hours > 0) {
      return [hours, minutes, seconds]
        .map(v => v < 10 ? "0" + v : v)
        .join(":");
    }
    return [minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .join(":");
  };

  return (
    <Card className={cn("bg-purple-700 text-white shadow-md")}> {/* Usando uma cor diferente */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Média de Tempo da Consulta</CardTitle>
        <Timer className="h-4 w-4 text-white" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatTime(mockAverageSeconds)}</div>
        <p className="text-white/80 text-xs">Duração média das consultas</p>
      </CardContent>
    </Card>
  );
};

export default AverageConsultationTimeCard;