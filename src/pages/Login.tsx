"use client";

import React, { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
// Removido: import SignUpForm from '@/components/SignUpForm'; // Não é mais necessário aqui
// Removido: import { cn } from '@/lib/utils'; // Não é mais necessário para estilo condicional

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession();
  const location = useLocation();
  // A view inicial agora será sempre 'sign_in' ou 'forgotten_password'
  const [authView, setAuthView] = useState<'sign_in' | 'forgotten_password' | 'update_password'>(() => {
    // Se houver um estado de 'view' na localização, use-o (ex: para 'forgotten_password')
    const state = location.state as { view?: 'forgotten_password' | 'update_password' };
    return state?.view || 'sign_in';
  });

  useEffect(() => {
    console.log('Login Page - isLoading:', isLoading, 'session:', session);
    if (session && !isLoading) {
      console.log('Login Page - Session found and not loading, redirecting to /painel.');
      navigate('/painel');
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    console.log('Login Page - Currently loading session...');
    return (
      <div className="min-h-screen flex items-center justify-center login-art-bg">
        <p className="text-lg text-gray-600 dark:text-gray-300">Carregando...</p>
      </div>
    );
  }

  // Removido: handleSignUpSuccess não é mais necessário aqui

  return (
    <div className="min-h-screen flex items-center justify-center login-art-bg p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md relative"> {/* Estilo simplificado */}
        <Button asChild variant="ghost" className="absolute top-4 left-4">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Link>
        </Button>
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mt-8">
          Bem-vindo ao AsasVet
        </h2>
        {/* O formulário de cadastro foi movido para a página SignUp.tsx */}
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary-foreground))',
                },
              },
            },
          }}
          theme="light"
          redirectTo={window.location.origin + '/painel'}
          view={authView}
          // onAuthStateChange={(event, session) => { // REMOVIDO: Esta prop não existe no componente Auth
          //   if (event === 'SIGNED_IN') {
          //     navigate('/painel');
          //   }
          // }}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Senha',
                email_input_placeholder: 'Seu email',
                password_input_placeholder: 'Sua senha',
                button_label: 'Entrar',
                social_provider_text: 'Entrar com {{provider}}',
                link_text: '', // Definido explicitamente como string vazia
              },
              sign_up: { // Adicionado explicitamente a seção sign_up
                link_text: '', // Definir o link_text como vazio para evitar renderização
              },
              forgotten_password: {
                email_label: 'Email',
                password_label: 'Sua senha',
                email_input_placeholder: 'Seu email',
                button_label: 'Enviar instruções de recuperação',
                link_text: 'Esqueceu sua senha?',
              },
              update_password: {
                password_label: 'Nova senha',
                password_input_placeholder: 'Sua nova senha',
                button_label: 'Atualizar senha',
              },
            },
          }}
        />
        {/* Links personalizados para alternar entre as views */}
        {authView === 'sign_in' && (
          <p className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/signup')}> {/* Direciona para a nova página de cadastro */}
              Cadastre-se
            </Button>
          </p>
        )}
        {/* Removido: Link para 'sign_up' quando já está em 'sign_up' */}
        {authView === 'forgotten_password' && (
          <p className="text-center text-sm text-muted-foreground">
            Lembrou da senha?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => setAuthView('sign_in')}>
              Entrar
            </Button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;