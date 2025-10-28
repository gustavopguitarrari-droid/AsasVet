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
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from "@/pages/Appointments"; // Importar a interface Appointment

const AppointmentsMonthlyChart: React.FC = () => {
  const { theme } = useTheme();
  const axisLabelColor = theme === "dark" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))";
  const gridLineColor = "hsl(var(--border))";

  const { user: appUser } = useUser();
  const userId = appUser?.id;

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
    queryKey: ['monthlyAppointmentsChart', userId],
    queryFn: async () => {
      if (!userId) return [];

      const sixMonthsAgo = format(startOfMonth(subMonths(today, 5)), 'yyyy-MM-dd');
      const nowFormatted = format(endOfMonth(today), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('appointments')
        .select('date, status')
        .eq('user_id', userId)
        .eq('status', 'Realizada')
        .gte('date', sixMonthsAgo)
        .lte('date', nowFormatted);

      if (error) {
        console.error("Erro ao buscar consultas mensais:", error);
        throw error;
      }
      return data as Appointment[];
    },
    enabled: !!userId,
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
    <Card>
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