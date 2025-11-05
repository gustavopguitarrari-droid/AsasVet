"use client";

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PawPrint } from 'lucide-react'; // Importar PawPrint
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
      <div className="w-full max-w-full md:max-w-4xl lg:max-w-6xl h-[90vh] overflow-y-auto p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md relative">
        <Button asChild variant="ghost" className="absolute top-4 left-4 text-white font-bold">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Link>
        </Button>
        <div className="flex items-center justify-center text-foreground mt-8 mb-6">
          <PawPrint className="h-8 w-8 mr-2 text-primary" />
          <h2 className="text-2xl font-bold">
            Crie sua Conta AsasVet
          </h2>
        </div>
        <SignUpForm onSuccess={handleSignUpSuccess} />
        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/login')}>
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