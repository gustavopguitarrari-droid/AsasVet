"use client";

import React from "react";
import {
  LineChart,
  Line,
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
import { Appointment } from "@/pages/Appointments";
import { format, subWeeks, startOfWeek, endOfWeek, eachWeekOfInterval, isSameWeek, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const AppointmentsWeeklyChart: React.FC = () => {
  const { theme } = useTheme();
  const axisLabelColor = theme === "dark" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))";
  const gridLineColor = "hsl(var(--border))";

  const { user: appUser } = useUser();
  const userId = appUser?.id;

  // Calcula as últimas 5 semanas para o gráfico
  const today = new Date();
  // Define explicitamente que a semana começa na segunda-feira (1) para o locale ptBR
  const weekOptions = { locale: ptBR, weekStartsOn: 1 as 0 | 1 | 2 | 3 | 4 | 5 | 6 }; 

  const weeksInterval = eachWeekOfInterval(
    {
      start: subWeeks(startOfWeek(today, weekOptions), 4), // Começa 4 semanas atrás para ter 5 semanas no total (semana atual + 4 anteriores)
      end: endOfWeek(today, weekOptions),
    },
    weekOptions // Passa weekOptions para eachWeekOfInterval também
  );

  const initialChartData = React.useMemo(() => {
    return weeksInterval.map((weekStart, index) => ({
      name: `Sem ${index + 1}`, // Ex: "Sem 1", "Sem 2"
      consultas: 0,
      weekStart: weekStart, // Guardar o início da semana para comparação
    }));
  }, [weeksInterval]);

  console.log("Weeks Interval (start dates):", weeksInterval.map(d => format(d, 'yyyy-MM-dd')));
  console.log("Initial Chart Data (with names):", initialChartData.map(item => item.name));


  const { data: appointments = [], isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['weeklyAppointmentsChart', userId],
    queryFn: async () => {
      if (!userId) return [];

      const fiveWeeksAgoStart = format(startOfWeek(subWeeks(today, 4), weekOptions), 'yyyy-MM-dd');
      const nowFormattedEnd = format(endOfWeek(today, weekOptions), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('appointments')
        .select('date, status')
        .eq('user_id', userId)
        .eq('status', 'Realizada')
        .gte('date', fiveWeeksAgoStart)
        .lte('date', nowFormattedEnd);

      if (error) {
        console.error("Erro ao buscar consultas semanais:", error);
        throw error;
      }
      return data as Appointment[];
    },
    enabled: !!userId,
  });

  const chartData = React.useMemo(() => {
    const dataMap = new Map(initialChartData.map(item => [format(item.weekStart, 'yyyy-MM-dd'), item.consultas]));

    appointments.forEach(appointment => {
      const appointmentDate = parseISO(appointment.date);
      const weekStartOfAppointment = startOfWeek(appointmentDate, weekOptions); // Usa weekOptions aqui
      const formattedWeekStart = format(weekStartOfAppointment, 'yyyy-MM-dd');

      // Encontra o item correspondente no initialChartData
      const chartItem = initialChartData.find(item => isSameWeek(item.weekStart, appointmentDate, weekOptions)); // Usa weekOptions aqui

      if (chartItem) {
        const currentCount = dataMap.get(formattedWeekStart) || 0;
        dataMap.set(formattedWeekStart, currentCount + 1);
      }
    });

    const finalData = initialChartData.map(item => ({
      ...item,
      consultas: dataMap.get(format(item.weekStart, 'yyyy-MM-dd')) || 0,
    }));
    console.log("Final Chart Data for rendering:", finalData.map(item => ({ name: item.name, consultas: item.consultas })));
    return finalData;
  }, [appointments, initialChartData, weekOptions]); // Adiciona weekOptions às dependências

  const totalConsultas = chartData.reduce((sum, entry) => sum + entry.consultas, 0);
  const averageConsultas = chartData.length > 0 ? totalConsultas / chartData.length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultas por Semana</CardTitle>
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
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} />
              <XAxis dataKey="name" stroke={axisLabelColor} />
              <YAxis stroke={axisLabelColor} />
              <Tooltip />
              <Line type="monotone" dataKey="consultas" stroke="#6366f1" activeDot={{ r: 8 }} /> {/* Cor fixa: indigo-500 */}
              <ReferenceLine
                y={averageConsultas}
                stroke="#4f46e5" // Cor fixa: indigo-700
                strokeDasharray="3 3"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          Média de consultas: <span className="font-semibold text-indigo-700">{averageConsultas.toFixed(0)}</span> {/* Cor fixa */}
        </p>
      </CardContent>
    </Card>
  );
};

export default AppointmentsWeeklyChart;