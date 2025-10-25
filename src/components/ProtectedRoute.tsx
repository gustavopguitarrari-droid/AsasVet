"use client";

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';
import { useUser } from '@/context/UserContext';
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
  const { user: appUser } = useUser();
  const location = useLocation();

  // Se a sessão ainda está sendo carregada, exibe um indicador de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-lg">Carregando sistema...</p>
      </div>
    );
  }

  // Se não há sessão (usuário não autenticado), redireciona para o login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Se appUser ainda é null/undefined após o carregamento (ex: falha silenciosa na busca do perfil)
  // Isso serve como uma salvaguarda adicional.
  if (!appUser) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <p className="text-lg">Preparando perfil do usuário...</p>
        </div>
      );
  }


  // Se o usuário for um "Veterinário" e a rota atual não estiver na lista de permitidas, redireciona para o Painel
  if (appUser.role === "Veterinário" && !allowedVeterinarioPaths.includes(location.pathname)) {
    console.log(`ProtectedRoute - Veterinário tentando acessar caminho proibido: ${location.pathname}. Redirecionando para /painel.`);
    return <Navigate to="/painel" replace />;
  }

  // Se autenticado e autorizado, renderiza o layout e o conteúdo da rota
  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;