import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes"; // Importar useTheme

const data = [
  { name: "Jan", consultas: 400 },
  { name: "Fev", consultas: 300 },
  { name: "Mar", consultas: 500 },
  { name: "Abr", consultas: 450 },
  { name: "Mai", consultas: 600 },
  { name: "Jun", consultas: 550 },
];

const AppointmentsMonthlyChart: React.FC = () => {
  const { theme } = useTheme(); // Obter o tema atual
  const axisLabelColor = theme === "dark" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))";
  const gridLineColor = "hsl(var(--border))"; // A cor da borda já se adapta ao tema

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
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AppointmentsMonthlyChart;