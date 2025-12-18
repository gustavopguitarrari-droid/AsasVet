"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SignUpForm from '@/components/SignUpForm';
import PlanSelectionDialog from '@/components/PlanSelectionDialog'; // Importar o novo diálogo
import { showSuccess } from '@/utils/toast'; // Importar showSuccess

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [isPlanSelectionDialogOpen, setIsPlanSelectionDialogOpen] = useState(false);
  const [newlyRegisteredUserId, setNewlyRegisteredUserId] = useState<string | null>(null);

  const handleSignUpSuccess = (userId: string) => {
    setNewlyRegisteredUserId(userId);
    setIsPlanSelectionDialogOpen(true); // Abre o diálogo de seleção de plano
  };

  const handlePlanSelected = () => {
    setIsPlanSelectionDialogOpen(false);
    navigate('/login'); // Redireciona para a página de login após a seleção do plano
  };

  return (
    <div className="min-h-screen flex items-center justify-center login-art-bg p-4">
      <div className="w-full max-w-full md:max-w-4xl lg:max-w-6xl h-[90vh] overflow-y-auto p-8 space-y-6 bg-creme-terra/70 backdrop-blur-sm rounded-xl shadow-lg relative"> {/* Alterado para rounded-xl e shadow-lg */}
        <Link to="/">
          <Button variant="ghost" className="absolute top-4 left-4 text-marrom-avela font-bold hover:bg-verde-folha-seca/20"> {/* Alterado cor do texto e hover */}
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </Link>
        <h2 className="text-2xl font-bold text-center text-marrom-avela mt-8"> {/* Alterado cor do texto */}
          Crie sua Conta AsasVet
        </h2>
        <SignUpForm onSuccess={handleSignUpSuccess} />
        <p className="text-center text-sm text-marrom-avela"> {/* Alterado cor do texto */}
          Já tem uma conta?{' '}
          <Button variant="link" className="p-0 h-auto font-bold text-verde-folha-seca hover:text-verde-folha-seca/80" onClick={() => navigate('/login')}> {/* Alterado cor do texto e hover */}
            Entrar
          </Button>
        </p>
      </div>

      {newlyRegisteredUserId && (
        <PlanSelectionDialog
          isOpen={isPlanSelectionDialogOpen}
          onClose={() => setIsPlanSelectionDialogOpen(false)}
          userId={newlyRegisteredUserId}
          onPlanSelected={handlePlanSelected}
        />
      )}
    </div>
  );
};

export default SignUp;