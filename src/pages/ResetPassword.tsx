"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Lock, Eye, EyeOff, PawPrint, ArrowLeft, AlertTriangle } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSession } from '@/context/SessionContext';

const resetPasswordSchema = z.object({
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  confirmPassword: z.string().min(6, "A confirmação de senha é obrigatória."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // NOVO: Usa o contexto da sessão para verificar o estado de recuperação
  const { isLoading: isSessionLoading, isAwaitingPasswordReset } = useSession();

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const handleResetPassword = async (values: ResetPasswordSchema) => {
    setIsSubmitting(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      showError(`Erro ao redefinir a senha: ${error.message}`);
      setError(error.message);
    } else {
      showSuccess("Sua senha foi redefinida com sucesso! Você pode fazer login agora.");
      navigate('/login');
    }
    setIsSubmitting(false);
  };

  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[url('/images/login-right-bg.png')] bg-cover bg-center theme-nature-vet">
        <p>Verificando link de recuperação...</p>
      </div>
    );
  }

  if (!isAwaitingPasswordReset) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[url('/images/login-right-bg.png')] bg-cover bg-center theme-nature-vet">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-2xl">
              <AlertTriangle className="h-8 w-8 mr-3 text-destructive" />
              Link Inválido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Este link de redefinição de senha é inválido ou já expirou.
            </p>
            <Button asChild className="w-full mt-4">
              <Link to="/login">Voltar para o Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[url('/images/login-right-bg.png')] bg-cover bg-center theme-nature-vet">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center text-landingPage-lp-marrom-avela z-10">
            <PawPrint className="h-8 w-8 mr-2" />
            <span className="text-2xl font-bold">AsasVet</span>
          </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-landingPage-lp-marrom-avela">
              Redefinir Senha
            </CardTitle>
            <CardDescription className="text-landingPage-lp-marrom-avela/80">
              Digite sua nova senha abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-3">
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
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
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="pr-10"
                        />
                      </FormControl>
                      <div
                        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Redefinindo..." : "Redefinir Senha"}
                </Button>
                <Button variant="link" size="sm" className="w-full !mt-1" type="button" asChild>
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Login
                  </Link>
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;