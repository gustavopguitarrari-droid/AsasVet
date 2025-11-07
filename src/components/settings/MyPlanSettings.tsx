"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Crown, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext"; // Importar useUser
import { useMutation } from "@tanstack/react-query"; // Importar useMutation
import { supabase } from "@/integrations/supabase/client"; // Importar supabase
import { showError, showSuccess } from "@/utils/toast"; // Importar toasts

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  stripePriceId: string; // NOVO: ID do preço do Stripe
  badgeColorClass: string;
  imageUrl?: string; // NOVO: URL da imagem de capa
}

const availablePlans: Plan[] = [
  {
    id: "vet-domiciliar",
    name: "ASAS VERDES", // Nome atualizado para ASAS VERDES
    price: "R$ 119,90/mês",
    features: ["1 Subusuário", "Gerenciamento de Clientes e Pets", "Agenda Básica"],
    stripePriceId: "price_1SPttkF1WTKnJRQoScNCQLjp", // ID do plano Vet Domiciliar
    badgeColorClass: "bg-green-500", // Cor do badge alterada para verde
    imageUrl: "/public/images/Plano Verde.png", // Adicionada a nova imagem
  },
  {
    id: "clinica-vet",
    name: "ASAS ROXAS", // Nome atualizado para ASAS ROXAS
    price: "R$ 200,00/mês",
    features: ["3 Subusuários", "Gerenciamento Completo", "Internação", "Caixa e Financeiro", "Suporte Prioritário"],
    stripePriceId: "price_YOUR_CLINICA_VET_PRICE_ID", // SUBSTITUA PELO SEU ID DE PREÇO REAL DO STRIPE
    badgeColorClass: "bg-purple-500", // Cor do badge alterada para roxo
    imageUrl: "/public/images/Plano Roxo.png", // Adicionada a nova imagem
  },
  {
    id: "hospital-vet",
    name: "Hospital Vet",
    price: "R$ 299,00/mês",
    features: ["10 Subusuários", "Todos os recursos Premium", "Relatórios Avançados", "Integrações Personalizadas", "Suporte Dedicado 24/7"],
    stripePriceId: "price_YOUR_HOSPITAL_VET_PRICE_ID", // SUBSTITUA PELO SEU ID DE PREÇO REAL DO STRIPE
    badgeColorClass: "bg-blue-500",
  },
];

interface PlanSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onPlanSelected: () => void;
}

const MyPlanSettings: React.FC = () => {
  const { user: appUser } = useUser();
  const currentPlanName = appUser?.planName || "ASAS VERDES"; // Assume "ASAS VERDES" como padrão se não houver plano

  const createStripeCheckoutSessionMutation = useMutation({
    mutationFn: async ({ priceId, userId }: { priceId: string; userId: string }) => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) throw new Error("User not authenticated.");

      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: JSON.stringify({ priceId, userId }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url; // Redireciona para o checkout do Stripe
      } else {
        showError("Não foi possível obter a URL de checkout do Stripe.");
      }
    },
    onError: (err: any) => {
      console.error("Erro ao iniciar checkout do Stripe:", err);
      showError(`Erro ao iniciar checkout: ${err.message}`);
    },
  });

  const handlePlanAction = (plan: Plan) => {
    if (!appUser?.id) {
      showError("Usuário não autenticado. Por favor, faça login novamente.");
      return;
    }

    if (plan.name === currentPlanName) {
      showSuccess("Você já está neste plano!");
      // Aqui você pode adicionar lógica para gerenciar a assinatura existente, se houver
      return;
    }

    createStripeCheckoutSessionMutation.mutate({ priceId: plan.stripePriceId, userId: appUser.id });
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
          Visualize os detalhes do seu plano atual e explore opções de upgrade.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "flex flex-col justify-between p-6",
                plan.name === currentPlanName ? "border-2 border-primary shadow-lg" : "border"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <Badge className={cn("text-white", plan.badgeColorClass)}>
                    {plan.name === currentPlanName ? "Ativo" : "Disponível"}
                  </Badge>
                </div>
                <p className="text-3xl font-extrabold mb-4">{plan.price}</p>
                {plan.imageUrl && (
                  <div className="mb-4 flex justify-center">
                    <img src={plan.imageUrl} alt={`Capa do plano ${plan.name}`} className="h-[500px] w-auto object-contain" />
                  </div>
                )}
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                variant={plan.name === currentPlanName ? "default" : "outline"}
                className={cn(
                  "w-full mt-6",
                  plan.name === currentPlanName && "bg-primary text-primary-foreground hover:bg-primary/90",
                  plan.name !== currentPlanName && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
                onClick={() => handlePlanAction(plan)}
                disabled={createStripeCheckoutSessionMutation.isPending}
              >
                {createStripeCheckoutSessionMutation.isPending ? "Carregando..." : (plan.name === currentPlanName ? "Plano Atual" : "Selecionar Plano")}
              </Button>
            </Card>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          (Os IDs de preço do Stripe são placeholders. Substitua-os pelos IDs reais dos seus produtos/preços no Stripe.)
        </p>
      </CardContent>
    </Card>
  );
};

export default MyPlanSettings;