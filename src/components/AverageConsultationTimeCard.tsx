"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { Appointment } from "@/pages/Appointments"; // Importar a interface Appointment
import { differenceInSeconds, parseISO, isValid } from "date-fns";

const AverageConsultationTimeCard: React.FC = () => {
  const { user: appUser } = useUser();
  const organizationId = appUser?.organizationId; // Usar organizationId

  // Query para buscar consultas finalizadas
  const { data: completedAppointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['completedAppointmentsDuration', organizationId], // Alterado para organizationId
    queryFn: async () => {
      if (!organizationId) return []; // Alterado para organizationId
      const { data, error } = await supabase
        .from('appointments')
        .select('start_time, completion_timestamp')
        .eq('organization_id', organizationId) // Filtrar por organization_id
        .eq('status', 'Realizada')
        .not('start_time', 'is', null) // Garante que start_time não é nulo
        .not('completion_timestamp', 'is', null); // Garante que completion_timestamp não é nulo
      if (error) {
        console.error("Erro ao buscar consultas finalizadas para média de tempo:", error);
        throw error;
      }
      return data as Appointment[];
    },
    enabled: !!organizationId, // Habilitar query apenas se organizationId estiver disponível
  });

  const calculateAverageTime = (appointments: Appointment[]) => {
    if (appointments.length === 0) return 0;

    let totalDurationSeconds = 0;
    let validAppointmentsCount = 0;

    appointments.forEach(appointment => {
      const startTime = appointment.start_time ? parseISO(appointment.start_time) : null;
      const completionTime = appointment.completion_timestamp ? parseISO(appointment.completion_timestamp) : null;

      if (startTime && completionTime && isValid(startTime) && isValid(completionTime)) {
        const duration = differenceInSeconds(completionTime, startTime);
        if (duration > 0) { // Apenas durações positivas
          totalDurationSeconds += duration;
          validAppointmentsCount++;
        }
      }
    });

    return validAppointmentsCount > 0 ? Math.round(totalDurationSeconds / validAppointmentsCount) : 0;
  };

  const averageSeconds = calculateAverageTime(completedAppointments);

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds === 0) return "00:00";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

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
    <Card className={cn("bg-purple-700 text-white shadow-md")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Média de Tempo da Consulta</CardTitle>
        <Timer className="h-4 w-4 text-white" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? "..." : formatTime(averageSeconds)}
        </div>
        <p className="text-white/80 text-xs">Duração média das consultas finalizadas</p>
      </CardContent>
    </Card>
  );
};

export default AverageConsultationTimeCard;