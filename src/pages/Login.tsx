"use client";

import React, { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { cn } from '@/lib/utils';
// import { useTheme } from 'next-themes'; // Removido

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading } = useSession();
  const location = useLocation();
  // const { resolvedTheme } = useTheme(); // Removido
  const [authView, setAuthView] = useState<'sign_in' | 'forgotten_password' | 'update_password'>(() => {
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

  // console.log('Login Page - Resolved Theme:', resolvedTheme); // Removido

  if (isLoading) {
    console.log('Login Page - Currently loading session...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-verde-bambu">
        <p className="text-lg text-marrom-avela">Carregando...</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4",
      "login-art-bg"
    )}>
      <div className="w-full max-w-sm p-6 space-y-4 rounded-xl shadow-lg relative bg-creme-terra/70 backdrop-blur-sm border border-marrom-avela/20 z-10 max-h-[80vh] overflow-y-auto"> {/* Alterado para rounded-xl e shadow-lg */}
        <Button asChild variant="ghost" className="absolute top-4 left-4 text-marrom-avela font-bold hover:bg-verde-folha-seca/20">
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
              default: { // Variáveis para o tema claro (nature-vet)
                colors: {
                  brand: 'hsl(var(--nv-primary-green))',
                  brandAccent: 'hsl(120 20% 18%)', /* Darker shade of primary green */
                  inputBackground: 'hsl(var(--nv-beige))',
                  inputBorder: 'hsl(30 15% 35%)', /* Dark brown for borders */
                  inputText: 'hsl(var(--nv-dark-brown))',
                  messageText: 'hsl(var(--nv-dark-brown))',
                  // Adicione outras variáveis de cor conforme necessário para o tema dark
                  // Por exemplo, para o fundo do Auth component, que ThemeSupa usa 'default'
                  defaultButtonBackground: 'hsl(var(--nv-primary-green))',
                  defaultButtonBackgroundHover: 'hsl(120 20% 18%)',
                  defaultButtonBorder: 'hsl(var(--nv-primary-green))',
                  defaultButtonText: 'hsl(var(--nv-beige))',
                  dividerBackground: 'hsl(30 15% 35%)',
                  anchorText: 'hsl(var(--nv-primary-green))',
                  anchorTextHover: 'hsl(120 20% 18%)',
                },
              },
            },
          }}
          theme="dark" {/* Alterado para tema dark para melhor contraste com nature-vet */}
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
        />
        {authView === 'sign_in' && (
          <p className="text-center text-sm text-marrom-avela">
            Não tem uma conta?{' '}
            <Button variant="link" className="p-0 h-auto font-bold text-marrom-avela hover:text-marrom-avela/80" onClick={() => navigate('/signup')}>
              Cadastre-se
            </Button>
          </p>
        )}
        {authView === 'forgotten_password' && (
          <p className="text-center text-sm text-marrom-avela">
            Lembrou da senha?{' '}
            <Button variant="link" className="p-0 h-auto text-verde-folha-seca hover:text-verde-folha-seca/80" onClick={() => setAuthView('sign_in')}>
              Entrar
            </Button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;