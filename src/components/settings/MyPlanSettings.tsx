"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Crown, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  type: "active" | "downgrade" | "upgrade";
  buttonText: string;
  buttonVariant: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  badgeColorClass: string;
}

const mockPlans: Plan[] = [
  {
    id: "basic",
    name: "Plano Básico",
    price: "R$ 49,90/mês",
    features: ["1 Subusuário", "Gerenciamento de Clientes e Pets", "Agenda Básica"],
    type: "downgrade",
    buttonText: "Fazer Downgrade",
    buttonVariant: "outline",
    badgeColorClass: "bg-gray-500",
  },
  {
    id: "premium",
    name: "Plano Premium",
    price: "R$ 99,90/mês",
    features: ["3 Subusuários", "Gerenciamento Completo", "Internação", "Caixa e Financeiro", "Suporte Prioritário"],
    type: "active",
    buttonText: "Gerenciar Assinatura",
    buttonVariant: "default",
    badgeColorClass: "bg-green-500",
  },
  {
    id: "enterprise",
    name: "Plano Empresarial",
    price: "R$ 199,90/mês",
    features: ["10 Subusuários", "Todos os recursos Premium", "Relatórios Avançados", "Integrações Personalizadas", "Suporte Dedicado 24/7"],
    type: "upgrade",
    buttonText: "Fazer Upgrade",
    buttonVariant: "default",
    badgeColorClass: "bg-blue-500",
  },
];

const MyPlanSettings: React.FC = () => {
  const handlePlanAction = (planName: string, action: string) => {
    console.log(`${action} clicked for ${planName}`);
    // Aqui você implementaria a lógica real para downgrade/upgrade/gerenciamento
    // Por exemplo, abrir um modal de confirmação ou redirecionar para uma página de checkout.
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Crown className="mr-2 h-5 w-5" /> Meu Plano
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          Visualize os detalhes do seu plano atual, opções de downgrade e upgrade.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockPlans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "flex flex-col justify-between p-6",
                plan.type === "active" ? "border-2 border-primary shadow-lg" : "border"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <Badge className={cn("text-white", plan.badgeColorClass)}>
                    {plan.type === "active" ? "Ativo" : (plan.type === "downgrade" ? "Anterior" : "Superior")}
                  </Badge>
                </div>
                <p className="text-3xl font-extrabold mb-4">{plan.price}</p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                variant={plan.buttonVariant}
                className={cn("w-full", plan.type === "active" && "bg-primary text-primary-foreground hover:bg-primary/90")}
                onClick={() => handlePlanAction(plan.name, plan.buttonText)}
              >
                {plan.buttonText}
              </Button>
            </Card>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          (Funcionalidade de gerenciamento de planos em desenvolvimento)
        </p>
      </CardContent>
    </Card>
  );
};

export default MyPlanSettings;