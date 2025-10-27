"use client";

import React, { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '@/context/SessionContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SignUpForm from '@/components/SignUpForm'; // Importar o novo componente SignUpForm

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession();
  const [authView, setAuthView] = useState<'sign_in' | 'sign_up' | 'forgotten_password' | 'update_password'>('sign_in');

  useEffect(() => {
    console.log('Login Page - isLoading:', isLoading, 'session:', session);
    if (session && !isLoading) {
      console.log('Login Page - Session found and not loading, redirecting to /painel.');
      navigate('/painel'); // Redirect to dashboard if already logged in
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

  const handleSignUpSuccess = () => {
    // After successful signup, switch back to sign_in view
    setAuthView('sign_in');
  };

  return (
    <div className="min-h-screen flex items-center justify-center login-art-bg p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md relative">
        <Button asChild variant="ghost" className="absolute top-4 left-4">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Link>
        </Button>
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mt-8">
          Bem-vindo ao AsasVet
        </h2>
        {authView === 'sign_up' ? (
          <SignUpForm onSuccess={handleSignUpSuccess} />
        ) : (
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
            onAuthStateChange={(event, session) => {
              if (event === 'SIGNED_IN') {
                navigate('/painel');
              }
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'Seu email',
                  password_input_placeholder: 'Sua senha',
                  button_label: 'Entrar',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Não tem uma conta? Cadastre-se',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'Seu email',
                  password_input_placeholder: 'Sua senha',
                  button_label: 'Cadastrar',
                  social_provider_text: 'Cadastrar com {{provider}}',
                  link_text: 'Já tem uma conta? Entrar',
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
        )}
        {/* Custom links to switch between views */}
        {authView === 'sign_in' && (
          <p className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => setAuthView('sign_up')}>
              Cadastre-se
            </Button>
          </p>
        )}
        {authView === 'sign_up' && (
          <p className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => setAuthView('sign_in')}>
              Entrar
            </Button>
          </p>
        )}
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