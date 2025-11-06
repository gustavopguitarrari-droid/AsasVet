"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { cn } from '@/lib/utils'; // Import cn for conditional classes

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession();
  const location = useLocation();
  const [authView, setAuthView] = useState<'sign_in' | 'forgotten_password' | 'update_password'>(() => {
    const state = location.state as { view?: 'forgotten_password' | 'update_password' };
    return state?.view || 'sign_in';
  });

  const [isButtonHovered, setIsButtonHovered] = useState(false); // Novo estado para hover
  const loginCardRef = useRef<HTMLDivElement>(null); // Ref para o card de login

  useEffect(() => {
    console.log('Login Page - isLoading:', isLoading, 'session:', session);
    if (session && !isLoading) {
      console.log('Login Page - Session found and not loading, redirecting to /painel.');
      navigate('/painel');
    }
  }, [session, isLoading, navigate]);

  useEffect(() => {
    const loginCardElement = loginCardRef.current;
    if (!loginCardElement) return;

    // Encontra o botão "Entrar" dentro do DOM renderizado pelo componente Auth
    // Geralmente é um botão com type="submit"
    const signInButton = loginCardElement.querySelector('button[type="submit"]');

    if (signInButton) {
      const handleMouseEnter = () => setIsButtonHovered(true);
      const handleMouseLeave = () => setIsButtonHovered(false);

      signInButton.addEventListener('mouseenter', handleMouseEnter);
      signInButton.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        signInButton.removeEventListener('mouseenter', handleMouseEnter);
        signInButton.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [authView]); // Re-executa o efeito se a view de autenticação mudar

  if (isLoading) {
    console.log('Login Page - Currently loading session...');
    return (
      <div className="min-h-screen flex items-center justify-center login-art-bg">
        <p className="text-lg text-gray-600 dark:text-gray-300">Carregando...</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4",
      isButtonHovered ? "login-art-bg-hover" : "login-art-bg" // Aplica a classe condicional de background
    )}>
      <div ref={loginCardRef} className="w-full max-w-md p-8 space-y-6 rounded-lg shadow-md relative bg-white dark:bg-gray-800 bg-opacity-30">
        <Button asChild variant="ghost" className="absolute top-4 left-4 text-white font-bold">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Link>
        </Button>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(188 39% 38%)', // Azul-esverdeado principal
                  brandAccent: 'hsl(188 39% 48%)', // Azul-esverdeado mais claro para hover
                  inputBackground: 'rgba(255, 255, 255, 0.1)',
                  inputBorder: 'rgba(255, 255, 255, 0.3)',
                  inputLabel: 'hsl(0 0% 100%)',
                  inputText: 'hsl(var(--primary-foreground))',
                  anchorText: 'hsl(var(--primary-foreground))',
                  messageText: 'hsl(var(--primary-foreground))',
                },
              },
              dark: {
                colors: {
                  inputLabel: 'hsl(0 0% 100%)',
                  inputText: 'hsl(0 0% 100%)',
                  anchorText: 'hsl(0 0% 100%)',
                  messageText: 'hsl(0 0% 100%)',
                },
              },
            },
          }}
          theme="dark"
          redirectTo={window.location.origin + '/painel'}
          view={authView}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Senha',
                email_input_placeholder: 'Seu email',
                password_input_placeholder: 'Sua senha',
                button_label: 'Entrar',
                social_provider_text: 'Entrar com {{provider}}',
                link_text: '',
              },
              sign_up: {
                link_text: '',
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
          className="custom-auth-labels"
        />
        {authView === 'sign_in' && (
          <p className="text-center text-sm text-white">
            Não tem uma conta?{' '}
            <Button variant="link" className="p-0 h-auto text-white hover:text-gray-200" onClick={() => navigate('/signup')}>
              Cadastre-se
            </Button>
          </p>
        )}
        {authView === 'forgotten_password' && (
          <p className="text-center text-sm text-white">
            Lembrou da senha?{' '}
            <Button variant="link" className="p-0 h-auto text-white hover:text-gray-200" onClick={() => setAuthView('sign_in')}>
              Entrar
            </Button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;