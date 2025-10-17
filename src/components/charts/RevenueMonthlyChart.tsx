import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes"; // Importar useTheme

const data = [
  { name: "Jan", receita: 4000 },
  { name: "Fev", receita: 3000 },
  { name: "Mar", receita: 5000 },
  { name: "Abr", receita: 4500 },
  { name: "Mai", receita: 6000 },
  { name: "Jun", receita: 5500 },
];

const RevenueMonthlyChart: React.FC = () => {
  const { theme } = useTheme(); // Obter o tema atual
  const axisLabelColor = theme === "dark" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))";
  const gridLineColor = "hsl(var(--border))"; // A cor da borda já se adapta ao tema

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita por Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} />
            <XAxis dataKey="name" stroke={axisLabelColor} />
            <YAxis stroke={axisLabelColor} />
            <Tooltip />
            <Area type="monotone" dataKey="receita" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueMonthlyChart;