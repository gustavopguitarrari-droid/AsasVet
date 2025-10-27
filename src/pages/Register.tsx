"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '@/components/RegisterForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils'; // Importar cn

const Register = () => {
  const navigate = useNavigate();

  const handleRegistrationSuccess = () => {
    navigate('/login'); // Redireciona para a página de login após o cadastro
  };

  return (
    <div className="min-h-screen flex items-center justify-center login-art-bg p-4 relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 text-muted-foreground hover:bg-accent"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Voltar</span>
      </Button>

      <div className={cn(
        "w-full max-w-2xl p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl", // Adicionado shadow-xl
        "border border-border" // Adicionado uma borda sutil
      )}>
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-primary dark:text-primary-foreground mb-6"> {/* Título mais impactante */}
          Crie Sua Conta AsasVet
        </h2>
        <RegisterForm onSuccess={handleRegistrationSuccess} />
      </div>
    </div>
  );
};

export default Register;