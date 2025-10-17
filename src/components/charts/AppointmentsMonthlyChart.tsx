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

const data = [
  { name: "Jan", consultas: 400 },
  { name: "Fev", consultas: 300 },
  { name: "Mar", consultas: 500 },
  { name: "Abr", consultas: 450 },
  { name: "Mai", consultas: 600 },
  { name: "Jun", consultas: 550 },
];

const AppointmentsMonthlyChart: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultas por Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="consultas" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AppointmentsMonthlyChart;