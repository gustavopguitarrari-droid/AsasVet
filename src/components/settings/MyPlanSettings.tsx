"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Crown } from "lucide-react";

const MyPlanSettings: React.FC = () => {
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
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <span>Plano atual: Premium</span>
        </div>
        <p className="text-sm text-muted-foreground">
          (Funcionalidade em desenvolvimento)
        </p>
      </CardContent>
    </Card>
  );
};

export default MyPlanSettings;