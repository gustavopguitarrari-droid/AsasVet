"use client";

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';
import { useUser } from '@/context/UserContext';
import Layout from './layout/Layout';
import { addDays, isAfter, parseISO, isValid } from 'date-fns';
import TrialEndedBlocker from './TrialEndedBlocker'; // Importar o novo componente

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, isLoading, isAwaitingPasswordReset } = useSession();
  const { user: appUser } = useUser();
  const location = useLocation();

  console.log('ProtectedRoute: Rendering. isLoading:', isLoading, 'session:', !!session, 'appUser:', !!appUser, 'path:', location.pathname);

  if (isLoading) {
    console.log('ProtectedRoute: Displaying "Carregando sistema..."');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-lg">Carregando sistema...</p>
      </div>
    );
  }

  if (!session) {
    console.log('ProtectedRoute: No session found, redirecting to /login.');
    return <Navigate to="/login" replace />;
  }

  // NOVO: Se o usuário estiver em um fluxo de recuperação de senha, force-o para a página de redefinição.
  if (isAwaitingPasswordReset) {
    console.log('ProtectedRoute: User is in password recovery state. Redirecting to /reset-password.');
    return <Navigate to="/reset-password" replace />;
  }

  if (!appUser) {
      console.log('ProtectedRoute: Session exists but appUser is null, displaying "Preparando perfil do usuário..."');
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <p className="text-lg">Preparando perfil do usuário...</p>
        </div>
      );
  }

  // Lógica de verificação do período de teste
  const registrationDate = parseISO(appUser.registeredTime);
  if (isValid(registrationDate)) {
    const expirationDate = addDays(registrationDate, 7);
    const isTrialPlan = appUser.planName === 'Plano Básico' || appUser.planName === 'Vet Domiciliar';
    const isTrialExpired = isAfter(new Date(), expirationDate);

    if (isTrialPlan && isTrialExpired) {
      // Se o teste expirou, só permite o acesso à página de configurações
      if (location.pathname === '/settings') {
        return <Layout>{children}</Layout>;
      }
      // Para todas as outras páginas, mostra a tela de bloqueio
      console.log('ProtectedRoute: Trial expired, showing blocker.');
      return <TrialEndedBlocker />;
    }
  }

  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;