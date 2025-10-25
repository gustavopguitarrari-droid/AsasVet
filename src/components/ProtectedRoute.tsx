"use client";

import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';
import Layout from './layout/Layout'; // Importar o Layout

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, isLoading } = useSession();

  useEffect(() => {
    console.log('ProtectedRoute - isLoading:', isLoading, 'session:', session);
    if (!isLoading && !session) {
      console.log('ProtectedRoute - Redirecting to /login because no session and not loading.');
    } else if (!isLoading && session) {
      console.log('ProtectedRoute - Session found, rendering children.');
    }
  }, [isLoading, session]);

  if (isLoading) {
    console.log('ProtectedRoute - Currently loading session...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg text-gray-600 dark:text-gray-300">Carregando...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, renderiza o layout e o conteúdo da rota
  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;