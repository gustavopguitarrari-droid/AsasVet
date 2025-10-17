import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine, // Importar ReferenceLine
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

  // Calcular a média de consultas
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
            {/* Adicionar a linha de referência para a média */}
            <ReferenceLine
              y={averageConsultas}
              stroke="hsl(var(--destructive))" // Cor vermelha para destaque
              strokeDasharray="3 3"
              label={{ value: `Média: ${averageConsultas.toFixed(0)}`, position: "right", fill: axisLabelColor }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AppointmentsMonthlyChart;