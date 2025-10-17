import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
}
from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes"; // Importar useTheme

const data = [
  { name: "Sem 1", consultas: 80 },
  { name: "Sem 2", consultas: 120 },
  { name: "Sem 3", consultas: 100 },
  { name: "Sem 4", consultas: 150 },
  { name: "Sem 5", consultas: 130 },
];

const AppointmentsWeeklyChart: React.FC = () => {
  const { theme } = useTheme(); // Obter o tema atual
  const axisLabelColor = theme === "dark" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))";
  const gridLineColor = "hsl(var(--border))"; // A cor da borda já se adapta ao tema

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
            <Line type="monotone" dataKey="consultas" stroke="hsl(var(--sidebar-item-bg-4))" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AppointmentsWeeklyChart;