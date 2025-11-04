"use client";

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';
import { useUser } from '@/context/UserContext';
import Layout from './layout/Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, isLoading } = useSession();
  const { user: appUser } = useUser();
  const location = useLocation();

  console.log('ProtectedRoute: Rendering. isLoading:', isLoading, 'session:', !!session, 'appUser:', !!appUser, 'path:', location.pathname);

  // Se a sessão ainda está sendo carregada, exibe um indicador de carregamento
  if (isLoading) {
    console.log('ProtectedRoute: Displaying "Carregando sistema..."');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-lg">Carregando sistema...</p>
      </div>
    );
  }

  // Se não há sessão (usuário não autenticado), redireciona para o login
  if (!session) {
    console.log('ProtectedRoute: No session found, redirecting to /login.');
    return <Navigate to="/login" replace />;
  }

  // Se appUser ainda é null/undefined após o carregamento (ex: falha silenciosa na busca do perfil)
  // Isso serve como uma salvaguarda adicional.
  if (!appUser) {
      console.log('ProtectedRoute: Session exists but appUser is null, displaying "Preparando perfil do usuário..."');
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <p className="text-lg">Preparando perfil do usuário...</p>
        </div>
      );
  }

  // Se autenticado, renderiza o layout e o conteúdo da rota.
  // As restrições de acesso a páginas específicas por cargo foram removidas aqui.
  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;