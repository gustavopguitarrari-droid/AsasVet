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

  // 1. Se a sessão ainda está sendo carregada (primeira carga da aplicação), mostre um loader.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-600 dark:text-gray-300">Carregando sessão...</p>
      </div>
    );
  }

  // 2. Se a sessão não existe (não autenticado ou deslogado), redirecione para o login.
  // Isso deve acontecer imediatamente após isLoading ser false, ou após um logout.
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 3. Se há uma sessão, mas o perfil do usuário ainda não foi carregado, mostre um loader para o perfil.
  // Isso pode acontecer se o fetch do perfil for assíncrono e levar um tempo.
  if (!appUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-600 dark:text-gray-300">Carregando perfil do usuário...</p>
      </div>
    );
  }

  // 4. Se o usuário for um "Veterinário" e a rota atual não estiver na lista de permitidas, redireciona para o Painel
  if (appUser.role === "Veterinário" && !allowedVeterinarioPaths.includes(location.pathname)) {
    console.log(`ProtectedRoute - Veterinário tentando acessar caminho proibido: ${location.pathname}. Redirecionando para /painel.`);
    return <Navigate to="/painel" replace />;
  }

  // 5. Se estiver logado e autorizado, renderiza o layout e o conteúdo da rota
  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;