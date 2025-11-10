"use client";

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  ShoppingCart,
  CircleDollarSign,
  TrendingDown,
  BarChart,
  Settings,
} from "lucide-react";
import { usePageTitle } from "@/context/PageTitleContext";
import { cn } from "@/lib/utils";

const financialSections = [
  {
    title: "Fluxo de Caixa",
    description: "Acompanhe todas as entradas e saídas.",
    icon: TrendingUp,
    link: "/financeiro/fluxo-de-caixa", // Link atualizado
  },
  {
    title: "Vendas",
    description: "Visualize o histórico de vendas.",
    icon: ShoppingCart,
    link: "/financeiro/vendas", // Link atualizado
  },
  {
    title: "Contas a Receber",
    description: "Gerencie os débitos de clientes.",
    icon: CircleDollarSign,
    link: "/financeiro/contas-a-receber", // Link atualizado
  },
  {
    title: "Despesas",
    description: "Registre e categorize suas despesas.",
    icon: TrendingDown,
    link: "#", // Placeholder link
  },
  {
    title: "Relatórios",
    description: "Gere relatórios financeiros detalhados.",
    icon: BarChart,
    link: "/financeiro/relatorios", // Link atualizado
  },
  {
    title: "Configurações",
    description: "Defina métodos de pagamento e mais.",
    icon: Settings,
    link: "#", // Placeholder link
  },
];

const cardColors = [
  "bg-dashboard-card-1",
  "bg-dashboard-card-2",
  "bg-dashboard-card-3",
  "bg-dashboard-card-4",
  "bg-dashboard-card-5",
  "bg-dashboard-card-6",
];

const Financeiro = () => {
  const { setPageTitle } = usePageTitle();
  useEffect(() => {
    setPageTitle("Financeiro");
    return () => setPageTitle("");
  }, [setPageTitle]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Central Financeira</h2>
      </div>
      <p className="text-muted-foreground">
        Selecione uma área para visualizar e gerenciar as finanças da sua clínica.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
        {financialSections.map((section, index) => (
          <Link to={section.link} key={section.title} className="block">
            <Card className={cn(
              "h-48 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ease-in-out",
              cardColors[index % cardColors.length]
            )}>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <section.icon className="h-6 w-6 mr-3 text-primary" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{section.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Financeiro;