"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { Appointment } from "@/pages/Appointments"; // Importar a interface Appointment
import { differenceInSeconds, parseISO, isValid } from "date-fns";

interface AverageWaitingTimeCardProps {
  className?: string; // Adicionado prop className
}

const AverageWaitingTimeCard: React.FC<AverageWaitingTimeCardProps> = ({ className }) => {
  const { user: appUser } = useUser();
  const organizationId = appUser?.organizationId; // Usar organizationId

  // Query para buscar consultas que foram iniciadas (Em Andamento ou Realizada)
  const { data: startedAppointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['startedAppointmentsWaitingTime', organizationId], // Alterado para organizationId
    queryFn: async () => {
      if (!organizationId) return []; // Alterado para organizationId
      const { data, error } = await supabase
        .from('appointments')
        .select('created_at, start_time')
        .eq('organization_id', organizationId) // Filtrar por organization_id
        .in('status', ['Em Andamento', 'Realizada']) // Inclui consultas em andamento e realizadas
        .not('start_time', 'is', null); // Garante que start_time não é nulo
      if (error) {
        console.error("Erro ao buscar consultas iniciadas para média de tempo de espera:", error);
        throw error;
      }
      return data as Appointment[];
    },
    enabled: !!organizationId, // Habilitar query apenas se organizationId estiver disponível
  });

  const calculateAverageWaitingTime = (appointments: Appointment[]) => {
    if (appointments.length === 0) return 0;

    let totalWaitingTimeSeconds = 0;
    let validAppointmentsCount = 0;

    appointments.forEach(appointment => {
      const createdAt = parseISO(appointment.created_at);
      const startTime = appointment.start_time ? parseISO(appointment.start_time) : null;

      if (isValid(createdAt) && startTime && isValid(startTime)) {
        const waitingDuration = differenceInSeconds(startTime, createdAt);
        if (waitingDuration >= 0) { // Apenas durações não negativas
          totalWaitingTimeSeconds += waitingDuration;
          validAppointmentsCount++;
        }
      }
    });

    return validAppointmentsCount > 0 ? Math.round(totalWaitingTimeSeconds / validAppointmentsCount) : 0;
  };

  const averageSeconds = calculateAverageWaitingTime(startedAppointments);

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Média de Tempo de Espera</CardTitle>
        <Clock className="h-4 w-4 text-current" /> {/* Usando text-current para herdar a cor */}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? "..." : formatTime(averageSeconds)}
        </div>
        <p className="text-current/80 text-xs">Tempo médio até o início da consulta</p> {/* Usando text-current/80 */}
      </CardContent>
    </Card>
  );
};

export default AverageWaitingTimeCard;