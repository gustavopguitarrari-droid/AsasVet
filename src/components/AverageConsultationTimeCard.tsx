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

interface AverageConsultationTimeCardProps {
  className?: string; // Adicionado prop className
}

const AverageConsultationTimeCard: React.FC<AverageConsultationTimeCardProps> = ({ className }) => {
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
    <Card className={cn("col-span-1 shadow-md", className)}> {/* Aplicando className aqui */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3"> {/* Reduzido pb e adicionado px, pt */}
        <CardTitle className="text-sm font-medium">Média de Tempo da Consulta</CardTitle>
        <Timer className="h-4 w-4 text-current" /> {/* Usando text-current para herdar a cor */}
      </CardHeader>
      <CardContent className="p-3"> {/* Reduzido o padding */}
        <div className="text-xl font-bold"> {/* Reduzido de text-2xl para text-xl */}
          {isLoading ? "..." : formatTime(averageSeconds)}
        </div>
        <p className="text-current/80 text-xs">Duração média das consultas finalizadas</p> {/* Usando text-current/80 */}
      </CardContent>
    </Card>
  );
};

export default AverageConsultationTimeCard;