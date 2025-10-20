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

const data = [
  { name: "Sem 1", consultas: 80 },
  { name: "Sem 2", consultas: 120 },
  { name: "Sem 3", consultas: 100 },
  { name: "Sem 4", consultas: 150 },
  { name: "Sem 5", consultas: 130 },
];

const AppointmentsWeeklyChart: React.FC = () => {
  const { theme } = useTheme();
  const axisLabelColor = theme === "dark" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))";
  const gridLineColor = "hsl(var(--border))";

  const totalConsultas = data.reduce((sum, entry) => sum + entry.consultas, 0);
  const averageConsultas = totalConsultas / data.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultas por Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
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
        <p className="text-sm text-muted-foreground mt-2">
          Média de consultas: <span className="font-semibold text-indigo-700">{averageConsultas.toFixed(0)}</span> {/* Cor fixa */}
        </p>
      </CardContent>
    </Card>
  );
};

export default AppointmentsWeeklyChart;