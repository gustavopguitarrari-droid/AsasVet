"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { useSession } from '@/context/SessionContext';
import { cn } from '@/lib/utils';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email("Por favor, insira um e-mail válido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Por favor, insira um e-mail válido para recuperação."),
});

type LoginSchema = z.infer<typeof loginSchema>;
type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { session, isLoading: isSessionLoading } = useSession();
  const [view, setView] = useState<'sign_in' | 'forgotten_password'>('sign_in');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const forgotPasswordForm = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (session && !isSessionLoading) {
      navigate('/painel');
    }
  }, [session, isSessionLoading, navigate]);

  const handleLogin = async (values: LoginSchema) => {
    setIsSubmitting(true);
    setFormError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      if (error.message === 'Invalid login credentials') {
        setFormError('Email ou senha inválidos.');
      } else {
        setFormError(error.message);
      }
    }
    setIsSubmitting(false);
  };

  const handlePasswordReset = async (values: ForgotPasswordSchema) => {
    setIsSubmitting(true);
    setFormError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      showError(`Erro ao enviar e-mail: ${error.message}`);
    } else {
      showSuccess("Se o e-mail estiver correto, você receberá instruções para redefinir sua senha.");
      setView('sign_in');
    }
    setIsSubmitting(false);
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4", "login-art-bg")}>
      <div className="w-full max-w-sm z-10">
        <Button asChild variant="secondary" className="absolute top-4 left-4 text-foreground font-bold">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Link>
        </Button>
        <Card className="bg-card/60 backdrop-blur-sm border border-border/20">
          <CardHeader className="text-center p-4">
            <CardTitle className="text-2xl">
              {view === 'sign_in' ? 'Bem-vindo(a) de volta!' : 'Recuperar Senha'}
            </CardTitle>
            <CardDescription>
              {view === 'sign_in' ? 'Faça login para acessar seu painel.' : 'Insira seu e-mail para receber as instruções.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {view === 'sign_in' ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={loginForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={loginForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Entrando..." : "Entrar"}
                  </Button>
                  <Button variant="link" size="sm" className="w-full !mt-2" type="button" onClick={() => setView('forgotten_password')}>
                    Esqueceu sua senha?
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...forgotPasswordForm}>
                <form onSubmit={forgotPasswordForm.handleSubmit(handlePasswordReset)} className="space-y-3">
                  <FormField control={forgotPasswordForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="seu@email.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar Instruções"}
                  </Button>
                  <Button variant="link" size="sm" className="w-full !mt-2" type="button" onClick={() => setView('sign_in')}>
                    Voltar para o Login
                  </Button>
                </form>
              </Form>
            )}
            <p className="mt-3 text-center text-sm text-foreground">
              Não tem uma conta?{' '}
              <Link to="/signup" className="font-bold text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;