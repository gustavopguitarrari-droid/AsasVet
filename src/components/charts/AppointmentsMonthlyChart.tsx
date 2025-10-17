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

const data = [
  { name: "Jan", consultas: 400 },
  { name: "Fev", consultas: 300 },
  { name: "Mar", consultas: 500 },
  { name: "Abr", consultas: 450 },
  { name: "Mai", consultas: 600 },
  { name: "Jun", consultas: 550 },
];

const AppointmentsMonthlyChart: React.FC = () => {
  const { theme } = useTheme();
  const axisLabelColor = theme === "dark" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))";
  const gridLineColor = "hsl(var(--border))";

  const totalConsultas = data.reduce((sum, entry) => sum + entry.consultas, 0);
  const averageConsultas = totalConsultas / data.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultas por Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} />
            <XAxis dataKey="name" stroke={axisLabelColor} />
            <YAxis stroke={axisLabelColor} />
            <Tooltip />
            <Bar dataKey="consultas" fill="hsl(var(--sidebar-item-bg-1))" />
            <ReferenceLine
              y={averageConsultas}
              stroke="hsl(var(--sidebar-item-bg-3))"
              strokeDasharray="3 3"
              strokeWidth={2}
            />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-muted-foreground mt-2">
          Média de consultas: <span className="font-semibold text-sidebar-item-bg-3">{averageConsultas.toFixed(0)}</span>
        </p>
      </CardContent>
    </Card>
  );
};

export default AppointmentsMonthlyChart;