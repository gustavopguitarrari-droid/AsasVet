"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { Link } from "react-router-dom";

const WaitingAppointmentsCard: React.FC = () => {
  const { user: appUser } = useUser();
  const userId = appUser?.id;

  const { data: waitingAppointmentsCount = 0, isLoading } = useQuery<number>({
    queryKey: ['waitingAppointmentsCount', userId],
    queryFn: async () => {
      if (!userId) return 0;
      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'Agendada'); // Contar apenas consultas com status 'Agendada'
      if (error) {
        console.error("Erro ao buscar contagem de consultas em espera:", error);
        throw error;
      }
      return count || 0;
    },
    enabled: !!userId,
  });

  return (
    <Link to="/consultas" state={{ activeTab: "em-espera" }} className="block">
      <Card className={cn("col-span-1 bg-gray-700 text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Consultas Em Espera</CardTitle>
          <CalendarClock className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent className="flex-1">
          <div className="text-2xl font-bold">
            {isLoading ? "..." : waitingAppointmentsCount.toLocaleString('pt-BR')}
          </div>
          <p className="text-white/80 text-xs">aguardando atendimento</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default WaitingAppointmentsCard;