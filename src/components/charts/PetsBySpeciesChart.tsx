import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { name: "Cachorros", value: 400 },
  { name: "Gatos", value: 300 },
  { name: "Pássaros", value: 150 },
  { name: "Outros", value: 100 },
];

const COLORS = [
  "hsl(var(--sidebar-item-bg-1))", // Azul
  "hsl(var(--sidebar-item-bg-2))", // Verde
  "hsl(var(--sidebar-item-bg-3))", // Laranja
  "hsl(var(--sidebar-item-bg-4))", // Rosa
];

const PetsBySpeciesChart: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Animais por Espécie</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PetsBySpeciesChart;