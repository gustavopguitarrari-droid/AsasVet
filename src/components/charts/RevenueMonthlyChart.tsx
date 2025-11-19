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
import { useColorTheme } from "@/context/ColorThemeContext";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types/cashier";
import { format, subMonths, eachMonthOfInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RevenueMonthlyChartProps {
  className?: string;
  transactions: Transaction[];
  isLoading: boolean;
}

const RevenueMonthlyChart: React.FC<RevenueMonthlyChartProps> = ({ className, transactions, isLoading }) => {
  const { colorTheme } = useColorTheme();
  const axisLabelColor = "hsl(var(--foreground))";
  const gridLineColor = "hsl(var(--border))";

  const chartData = React.useMemo(() => {
    const today = new Date();
    const monthsInterval = eachMonthOfInterval({
      start: subMonths(today, 5),
      end: today,
    });

    const initialData = monthsInterval.map(month => ({
      name: format(month, 'MMM', { locale: ptBR }),
      receita: 0,
    }));

    const dataMap = new Map(initialData.map(item => [item.name, item.receita]));

    transactions
      .filter(tx => tx.type === 'Entrada')
      .forEach(tx => {
        const txDate = parseISO(tx.date);
        const monthName = format(txDate, 'MMM', { locale: ptBR });
        if (dataMap.has(monthName)) {
          dataMap.set(monthName, dataMap.get(monthName)! + tx.amount);
        }
      });

    return initialData.map(item => ({
      ...item,
      receita: dataMap.get(item.name) || 0,
    }));
  }, [transactions]);

  return (
    <Card className={cn("rounded-xl", className)}>
      <CardHeader>
        <CardTitle>Receita por Mês</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} />
              <XAxis dataKey="name" stroke={axisLabelColor} />
              <YAxis stroke={axisLabelColor} tickFormatter={(value) => `R$${value}`} />
              <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2).replace('.', ',')}`, "Receita"]} />
              <Area type="monotone" dataKey="receita" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueMonthlyChart;