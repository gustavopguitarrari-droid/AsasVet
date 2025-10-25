"use client";

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom'; // Importar useLocation
import { useSession } from '@/context/SessionContext';
import { useUser } from '@/context/UserContext'; // Importar useUser
import { hasAccess } from '@/lib/permissions'; // Importar hasAccess
import Layout from './layout/Layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, isLoading } = useSession();
  const { user: appUser } = useUser(); // Obter o usuário do UserContext
  const location = useLocation(); // Obter a localização atual

  useEffect(() => {
    console.log('ProtectedRoute - isLoading:', isLoading, 'session:', session, 'appUser:', appUser, 'path:', location.pathname);
    if (!isLoading) {
      if (!session) {
        console.log('ProtectedRoute - Redirecting to /login because no session.');
      } else if (!appUser?.role) {
        // If session exists but user role is not yet loaded/available in context
        console.log('ProtectedRoute - Session exists, but user role not loaded. Waiting...');
        // This might happen briefly after sign-in before profile is fetched.
        // We can show a loading state or wait for appUser to be populated.
      } else if (!hasAccess(appUser.role, location.pathname)) {
        console.log(`ProtectedRoute - User role "${appUser.role}" does not have access to "${location.pathname}". Redirecting to /painel.`);
      } else {
        console.log(`ProtectedRoute - User role "${appUser.role}" has access to "${location.pathname}". Rendering children.`);
      }
    }
  }, [isLoading, session, appUser, location.pathname]);

  if (isLoading || !appUser?.role) { // Adicionado !appUser?.role para esperar o cargo carregar
    console.log('ProtectedRoute - Currently loading session or user role...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-600 dark:text-gray-300">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Verifica se o usuário tem permissão para a rota atual
  if (!hasAccess(appUser.role, location.pathname)) {
    // Redireciona para o painel se não tiver permissão
    return <Navigate to="/painel" replace />;
  }

  // Se estiver logado e autorizado, renderiza o layout e o conteúdo da rota
  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;