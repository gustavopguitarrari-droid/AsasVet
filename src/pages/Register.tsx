"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '@/components/RegisterForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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

      <div className="w-full max-w-2xl p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Crie Sua Conta AsasVet
        </h2>
        <RegisterForm onSuccess={handleRegistrationSuccess} />
      </div>
    </div>
  );
};

export default Register;