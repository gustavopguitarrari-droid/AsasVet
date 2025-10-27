"use client";

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SignUpForm from '@/components/SignUpForm';
import { showSuccess } from '@/utils/toast'; // Importar showSuccess

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const handleSignUpSuccess = () => {
    showSuccess("Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.");
    navigate('/login'); // Redireciona para a página de login após o cadastro
  };

  return (
    <div className="min-h-screen flex items-center justify-center login-art-bg p-4">
      <div className="w-full max-w-full md:max-w-4xl lg:max-w-6xl h-[90vh] overflow-y-auto p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md relative">
        <Button asChild variant="ghost" className="absolute top-4 left-4">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Link>
        </Button>
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mt-8">
          Crie sua Conta AsasVet
        </h2>
        <SignUpForm onSuccess={handleSignUpSuccess} />
        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/login')}>
            Entrar
          </Button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;