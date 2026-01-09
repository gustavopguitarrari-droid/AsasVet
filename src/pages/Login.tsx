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
import { ArrowLeft, Mail, Lock, Eye, EyeOff, PawPrint } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

  // State for typing animation
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const textToType = "Bem-vindo.";

  useEffect(() => {
    const handleTyping = () => {
      const currentText = isDeleting
        ? textToType.substring(0, typedText.length - 1)
        : textToType.substring(0, typedText.length + 1);

      setTypedText(currentText);

      if (!isDeleting && currentText === textToType) {
        // Pause at the end before deleting
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const typingTimeout = setTimeout(handleTyping, isDeleting ? 75 : 150);

    return () => clearTimeout(typingTimeout);
  }, [typedText, isDeleting, loopNum]);


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
      } else if (error.message === 'Email not confirmed') {
        setFormError('E-mail não confirmado. Por favor, verifique sua caixa de entrada.');
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
      redirectTo: `${window.location.origin}/reset-password`,
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
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 theme-nature-vet">
      <div className="hidden lg:flex relative flex-col items-center justify-end p-10 pb-20 text-white">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/signup-background.png')" }} />
        <div className="absolute inset-0 bg-black/40" />
        
        <Link to="/" className="absolute top-8 left-8 flex items-center text-white z-10">
            <PawPrint className="h-8 w-8 mr-2" />
            <span className="text-2xl font-bold">AsasVet</span>
        </Link>
        <div className="text-center space-y-4 relative z-10">
            <h1 className="text-4xl font-bold h-12">
              {typedText}
              <span className="typing-cursor"></span>
            </h1>
            <p className="text-lg text-white/80">
              A gestão que te dá Asas te espera!
            </p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 bg-[url('/images/login-right-bg.png')] bg-cover bg-center">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex">
            <Button asChild variant="ghost">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Início
              </Link>
            </Button>
          </div>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-landingPage-lp-marrom-avela">
                {view === 'sign_in' ? 'Acesse seu Painel' : 'Recuperar Senha'}
              </CardTitle>
              {view !== 'sign_in' && (
                <CardDescription className="text-landingPage-lp-marrom-avela/80">
                  Insira seu e-mail para receber as instruções.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {view === 'sign_in' ? (
                <Form {...loginForm}>
                  <form key="login-form" onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-3">
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
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              className="pr-10"
                            />
                          </FormControl>
                          <div
                            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                            onMouseDown={() => setShowPassword(true)}
                            onMouseUp={() => setShowPassword(false)}
                            onMouseLeave={() => setShowPassword(false)}
                            onTouchStart={(e) => { e.preventDefault(); setShowPassword(true); }}
                            onTouchEnd={(e) => { e.preventDefault(); setShowPassword(false); }}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {formError && <p className="text-sm font-medium text-destructive text-center">{formError}</p>}
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Entrando..." : "Entrar"}
                    </Button>
                    <Button variant="link" size="sm" className="w-full !mt-1" type="button" onClick={() => setView('forgotten_password')}>
                      Esqueceu sua senha?
                    </Button>
                    <p className="text-center text-sm text-landingPage-lp-marrom-avela !mt-4">
                      Não tem uma conta?{' '}
                      <Link to="/signup" className="font-bold text-primary hover:underline">
                        Cadastre-se
                      </Link>
                    </p>
                  </form>
                </Form>
              ) : (
                <Form {...forgotPasswordForm}>
                  <form key="forgot-password-form" onSubmit={forgotPasswordForm.handleSubmit(handlePasswordReset)} className="space-y-3">
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
                    <Button variant="link" size="sm" className="w-full !mt-1" type="button" onClick={() => setView('sign_in')}>
                      Voltar para o Login
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;