"use client";

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    // Pode renderizar um spinner ou uma tela de carregamento aqui
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-600 dark:text-gray-300">Verificando autenticação...</p>
      </div>
    );
  }

  if (!session) {
    // Se não houver sessão e não estiver carregando, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;