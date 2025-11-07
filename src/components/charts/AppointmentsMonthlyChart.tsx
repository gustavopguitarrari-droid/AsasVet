"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useColorTheme } from "@/context/ColorThemeContext"; // Importar useColorTheme
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from "@/pages/Appointments"; // Importar a interface Appointment
import { cn } from "@/lib/utils"; // Importar cn

interface AppointmentsMonthlyChartProps {
  className?: string; // Adicionado prop className
}

const AppointmentsMonthlyChart: React.FC<AppointmentsMonthlyChartProps> = ({ className }) => {
  const { colorTheme } = useColorTheme(); // Obter o tema atual
  // As cores do eixo e da grade agora se adaptam automaticamente via CSS,
  // pois as variáveis CSS são definidas no globals.css para cada tema.
  const axisLabelColor = "hsl(var(--foreground))";
  const gridLineColor = "hsl(var(--border))";

  const { user: appUser } = useUser();
  const organizationId = appUser?.organizationId; // Usar organizationId

  // Calcula os últimos 6 meses para o gráfico
  const today = new Date();
  const monthsInterval = eachMonthOfInterval({
    start: subMonths(today, 5), // Começa 5 meses atrás para ter 6 meses no total (mês atual + 5 anteriores)
    end: today,
  });

  const initialChartData = React.useMemo(() => {
    return monthsInterval.map(month => ({
      name: format(month, 'MMM', { locale: ptBR }), // Ex: "Jan", "Fev"
      consultas: 0,
    }));
  }, [monthsInterval]);

  const { data: appointments = [], isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['monthlyAppointmentsChart', organizationId], // Alterado para organizationId
    queryFn: async () => {
      if (!organizationId) return []; // Alterado para organizationId

      const sixMonthsAgo = format(startOfMonth(subMonths(today, 5)), 'yyyy-MM-dd');
      const nowFormatted = format(endOfMonth(today), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('appointments')
        .select('date, status')
        .eq('organization_id', organizationId) // Filtrar por organization_id
        .eq('status', 'Realizada')
        .gte('date', sixMonthsAgo)
        .lte('date', nowFormatted);

      if (error) {
        console.error("Erro ao buscar consultas mensais:", error);
        throw error;
      }
      return data as Appointment[];
    },
    enabled: !!organizationId, // Habilitar query apenas se organizationId estiver disponível
  });

  const chartData = React.useMemo(() => {
    const dataMap = new Map(initialChartData.map(item => [item.name, item.consultas]));

    appointments.forEach(appointment => {
      const monthName = format(parseISO(appointment.date), 'MMM', { locale: ptBR });
      if (dataMap.has(monthName)) {
        dataMap.set(monthName, dataMap.get(monthName)! + 1);
      }
    });

    return initialChartData.map(item => ({
      ...item,
      consultas: dataMap.get(item.name) || 0,
    }));
  }, [appointments, initialChartData]);

  const totalConsultas = chartData.reduce((sum, entry) => sum + entry.consultas, 0);
  const averageConsultas = chartData.length > 0 ? totalConsultas / chartData.length : 0;

  return (
    <Card className={cn("", className)}> {/* Aplicando className aqui */}
      <CardHeader>
        <CardTitle>Consultas por Mês</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-destructive">Erro ao carregar dados: {error.message}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} />
              <XAxis dataKey="name" stroke={axisLabelColor} />
              <YAxis stroke={axisLabelColor} />
              <Tooltip />
              <Bar dataKey="consultas" fill="#3b82f6" /> {/* Cor fixa: blue-500 */}
              <ReferenceLine
                y={averageConsultas}
                stroke="#2563eb" // Cor fixa: blue-700
                strokeDasharray="3 3"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          Média de consultas: <span className="font-semibold text-blue-700">{averageConsultas.toFixed(0)}</span> {/* Cor fixa */}
        </p>
      </CardContent>
    </Card>
  );
};

export default AppointmentsMonthlyChart;