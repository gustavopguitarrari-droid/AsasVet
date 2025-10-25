"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Crown, CheckCircle } from "lucide-react"; // Importar CheckCircle para o status
import { Badge } from "@/components/ui/badge"; // Importar Badge

const MyPlanSettings: React.FC = () => {
  // Dados mock para o plano atual
  const currentPlan = {
    name: "Premium",
    status: "Ativo",
    features: ["Acesso total a funcionalidades", "Suporte prioritário", "5 subusuários"],
    price: "R$ 99,90/mês",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Crown className="mr-2 h-5 w-5" /> Meu Plano
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Visualize os detalhes do seu plano atual, histórico de pagamentos e opções de upgrade.
        </p>

        {/* Card para exibir o plano atual */}
        <div className="border rounded-lg p-4 bg-secondary flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-primary" />
            <div>
              <p className="text-lg font-semibold text-primary-foreground">Plano: {currentPlan.name}</p>
              <p className="text-sm text-muted-foreground">{currentPlan.price}</p>
            </div>
          </div>
          <Badge className="bg-green-500 text-white flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" /> {currentPlan.status}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          (Funcionalidade em desenvolvimento)
        </p>
      </CardContent>
    </Card>
  );
};

export default MyPlanSettings;