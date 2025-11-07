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
import { useColorTheme } from "@/context/ColorThemeContext"; // Importar useColorTheme

const data = [
  { name: "Jan", receita: 4000 },
  { name: "Fev", receita: 3000 },
  { name: "Mar", receita: 5000 },
  { name: "Abr", receita: 4500 },
  { name: "Mai", receita: 6000 },
  { name: "Jun", receita: 5500 },
];

const RevenueMonthlyChart: React.FC = () => {
  const { colorTheme } = useColorTheme(); // Obter o tema atual
  // As cores do eixo e da grade agora se adaptam automaticamente via CSS,
  // pois as variáveis CSS são definidas no globals.css para cada tema.
  const axisLabelColor = "hsl(var(--foreground))";
  const gridLineColor = "hsl(var(--border))";

  return (
    <Card className="rounded-xl">
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
            <Area type="monotone" dataKey="receita" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} /> {/* Cor fixa: red-500 */}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueMonthlyChart;