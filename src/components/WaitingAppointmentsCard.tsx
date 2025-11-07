"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { Link } from "react-router-dom";

interface WaitingAppointmentsCardProps {
  className?: string; // Adicionado prop className
}

const WaitingAppointmentsCard: React.FC<WaitingAppointmentsCardProps> = ({ className }) => {
  const { user: appUser } = useUser();
  const organizationId = appUser?.organizationId; // Usar organizationId

  const { data: waitingAppointmentsCount = 0, isLoading } = useQuery<number>({
    queryKey: ['waitingAppointmentsCount', organizationId], // Alterado para organizationId
    queryFn: async () => {
      if (!organizationId) return 0; // Alterado para organizationId
      const { count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId) // Filtrar por organization_id
        .eq('status', 'Agendada'); // Contar apenas consultas com status 'Agendada'
      if (error) {
        console.error("Erro ao buscar contagem de consultas em espera:", error);
        throw error;
      }
      return count || 0;
    },
    enabled: !!organizationId, // Habilitar query apenas se organizationId estiver disponível
  });

  return (
    <Link to="/consultas" state={{ activeTab: "em-espera" }} className="block">
      <Card className={cn("col-span-1 shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full", className)}> {/* Aplicando className aqui */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Consultas Em Espera</CardTitle>
          <CalendarClock className="h-4 w-4 text-current" /> {/* Usando text-current para herdar a cor */}
        </CardHeader>
        <CardContent className="flex-1">
          <div className="text-2xl font-bold">
            {isLoading ? "..." : waitingAppointmentsCount.toLocaleString('pt-BR')}
          </div>
          <p className="text-current/80 text-xs">aguardando atendimento</p> {/* Usando text-current/80 */}
        </CardContent>
      </Card>
    </Link>
  );
};

export default WaitingAppointmentsCard;