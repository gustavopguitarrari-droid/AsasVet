"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  badgeText: string;
  badgeColorClass: string;
}

const availablePlans: Plan[] = [
  {
    id: "basic",
    name: "Plano Básico",
    price: "R$ 49,90/mês",
    features: ["1 Subusuário", "Gerenciamento de Clientes e Pets", "Agenda Básica"],
    badgeText: "Básico",
    badgeColorClass: "bg-gray-500",
  },
  {
    id: "premium",
    name: "Plano Premium",
    price: "R$ 99,90/mês",
    features: ["3 Subusuários", "Gerenciamento Completo", "Internação", "Caixa e Financeiro", "Suporte Prioritário"],
    badgeText: "Premium",
    badgeColorClass: "bg-green-500",
  },
  {
    id: "enterprise",
    name: "Plano Empresarial",
    price: "R$ 199,90/mês",
    features: ["10 Subusuários", "Todos os recursos Premium", "Relatórios Avançados", "Integrações Personalizadas", "Suporte Dedicado 24/7"],
    badgeText: "Empresarial",
    badgeColorClass: "bg-blue-500",
  },
];

interface PlanSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onPlanSelected: () => void;
}

const PlanSelectionDialog: React.FC<PlanSelectionDialogProps> = ({ isOpen, onClose, userId, onPlanSelected }) => {
  const queryClient = useQueryClient();
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>(availablePlans[0].id); // Default to Basic

  const updatePlanMutation = useMutation({
    mutationFn: async (planName: string) => {
      if (!userId) throw new Error("User ID not available.");
      const { data, error } = await supabase
        .from('profiles')
        .update({ plan_name: planName })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles', userId] });
      showSuccess("Plano selecionado com sucesso!");
      onPlanSelected(); // Call callback to navigate to login
    },
    onError: (error) => {
      showError(`Erro ao selecionar plano: ${error.message}`);
    },
  });

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlanId(plan.id);
  };

  const handleConfirmPlan = () => {
    const plan = availablePlans.find(p => p.id === selectedPlanId);
    if (plan) {
      updatePlanMutation.mutate(plan.name);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Crown className="h-5 w-5 mr-2" /> Escolha seu Plano
          </DialogTitle>
          <DialogDescription>
            Selecione o plano que melhor se adapta às necessidades da sua clínica.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 overflow-y-auto">
          {availablePlans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "flex flex-col justify-between p-6 cursor-pointer transition-all duration-200",
                selectedPlanId === plan.id ? "border-2 border-primary shadow-lg scale-105" : "border hover:shadow-md"
              )}
              onClick={() => handleSelectPlan(plan)}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <Badge className={cn("text-white", plan.badgeColorClass)}>
                    {plan.badgeText}
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
                variant={selectedPlanId === plan.id ? "default" : "outline"}
                className="w-full"
                onClick={() => handleSelectPlan(plan)}
              >
                {selectedPlanId === plan.id ? "Plano Selecionado" : "Selecionar Plano"}
              </Button>
            </Card>
          ))}
        </div>

        <DialogFooter className="pt-4">
          <Button
            onClick={handleConfirmPlan}
            disabled={updatePlanMutation.isPending}
            className="w-full"
          >
            {updatePlanMutation.isPending ? "Confirmando..." : "Confirmar Plano"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlanSelectionDialog;