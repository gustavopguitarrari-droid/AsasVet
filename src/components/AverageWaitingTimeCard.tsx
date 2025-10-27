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

const AverageWaitingTimeCard: React.FC = () => {
  const { user: appUser } = useUser();
  const userId = appUser?.id;

  // Query para buscar consultas canceladas
  const { data: cancelledAppointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['cancelledAppointmentsWaitingTime', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select('created_at, completion_timestamp')
        .eq('user_id', userId)
        .eq('status', 'Cancelada')
        .not('completion_timestamp', 'is', null); // Garante que completion_timestamp não é nulo
      if (error) {
        console.error("Erro ao buscar consultas canceladas para média de tempo de espera:", error);
        throw error;
      }
      return data as Appointment[];
    },
    enabled: !!userId,
  });

  const calculateAverageWaitingTime = (appointments: Appointment[]) => {
    if (appointments.length === 0) return 0;

    let totalWaitingTimeSeconds = 0;
    let validAppointmentsCount = 0;

    appointments.forEach(appointment => {
      const createdAt = parseISO(appointment.created_at);
      const completionTime = appointment.completion_timestamp ? parseISO(appointment.completion_timestamp) : null;

      if (isValid(createdAt) && completionTime && isValid(completionTime)) {
        const waitingDuration = differenceInSeconds(completionTime, createdAt);
        if (waitingDuration > 0) { // Apenas durações positivas
          totalWaitingTimeSeconds += waitingDuration;
          validAppointmentsCount++;
        }
      }
    });

    return validAppointmentsCount > 0 ? Math.round(totalWaitingTimeSeconds / validAppointmentsCount) : 0;
  };

  const averageSeconds = calculateAverageWaitingTime(cancelledAppointments);

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
    <Card className={cn("bg-yellow-600 text-white shadow-md")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Média de Tempo de Espera</CardTitle>
        <Clock className="h-4 w-4 text-white" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? "..." : formatTime(averageSeconds)}
        </div>
        <p className="text-white/80 text-xs">Para consultas canceladas</p>
      </CardContent>
    </Card>
  );
};

export default AverageWaitingTimeCard;