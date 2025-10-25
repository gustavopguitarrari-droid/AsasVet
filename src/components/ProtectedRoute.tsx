"use client";

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';
import { useUser } from '@/context/UserContext'; // Importar useUser
import Layout from './layout/Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Rotas permitidas para o cargo "Veterinário"
const allowedVeterinarioPaths = [
  '/painel',
  '/consultas',
  '/internacao',
  '/cadastro',
  '/medical-records', // Agenda
  '/profile', // Perfil deve ser acessível a todos os cargos
];

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, isLoading } = useSession();
  const { user: appUser } = useUser(); // Obter o usuário com o cargo do UserContext
  const location = useLocation();

  // Exibe um estado de carregamento enquanto a sessão e o perfil do usuário estão sendo carregados
  if (isLoading || !appUser) { // Espera tanto pela sessão quanto pelos dados do usuário (incluindo o cargo)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-600 dark:text-gray-300">Carregando...</p>
      </div>
    );
  }

  // Se não houver sessão, redireciona para a página de login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário for um "Veterinário" e a rota atual não estiver na lista de permitidas, redireciona para o Painel
  if (appUser.role === "Veterinário" && !allowedVeterinarioPaths.includes(location.pathname)) {
    console.log(`ProtectedRoute - Veterinário tentando acessar caminho proibido: ${location.pathname}. Redirecionando para /painel.`);
    return <Navigate to="/painel" replace />;
  }

  // Se estiver logado e autorizado, renderiza o layout e o conteúdo da rota
  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;