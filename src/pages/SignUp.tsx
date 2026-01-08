"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, User as UserIcon, Phone, IdCard, Home, MapPin, CheckCircle, PawPrint, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { lookupCep } from "@/utils/cepLookup";
import { cn } from "@/lib/utils";

type SignUpFormValues = z.infer<ReturnType<typeof createFormSchema>>;

const createFormSchema = (registrationType: 'cpf' | 'cnpj' | null) => {
  const baseSchema = z.object({
    email: z.string().email("E-mail inválido.").min(1, "O e-mail é obrigatório."),
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
    confirmPassword: z.string().min(6, "A confirmação de senha é obrigatória."),
    phone: z.string().min(1, "O telefone é obrigatório."),
    cep: z.string()
      .min(8, "O CEP deve ter 8 dígitos.")
      .max(9, "O CEP deve ter no máximo 9 dígitos (com formatação).")
      .transform(val => val.replace(/\D/g, '')),
    street: z.string().min(1, "A rua é obrigatória."),
    number: z.string().min(1, "O número é obrigatório."),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, "O bairro é obrigatório."),
    city: z.string().min(1, "A cidade é obrigatória."),
    state: z.string().min(2, "O estado é obrigatório.").max(2, "O estado deve ter 2 letras."),
  });

  const registrationFields = registrationType === 'cnpj'
    ? {
        firstName: z.string().min(1, "A razão social é obrigatória."),
        lastName: z.string().optional(), // Nome fantasia opcional e campo escondido
        cpf: z.string().min(14, "O CNPJ deve ter 14 dígitos.").max(18, "O CNPJ deve ter no máximo 18 dígitos.").transform(val => val.replace(/\D/g, '')),
      }
    : {
        firstName: z.string().min(1, "O nome é obrigatório."),
        lastName: z.string().min(1, "O sobrenome é obrigatório."),
        cpf: z.string().min(11, "O CPF deve ter 11 dígitos.").max(14, "O CPF deve ter no máximo 14 dígitos.").transform(val => val.replace(/\D/g, '')),
      };

  return baseSchema.extend(registrationFields).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });
};

const SignUp = () => {
  const navigate = useNavigate();
  const [registrationType, setRegistrationType] = useState<'cpf' | 'cnpj' | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formSchema = useMemo(() => createFormSchema(registrationType), [registrationType]);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      cpf: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof SignUpFormValues)[] = [];
    if (step === 1) {
      fieldsToValidate = registrationType === 'cpf'
        ? ['firstName', 'lastName', 'email', 'password', 'confirmPassword']
        : ['firstName', 'email', 'password', 'confirmPassword'];
    } else if (step === 2) {
      fieldsToValidate = ['phone', 'cpf'];
    }
    
    const isStepValid = await form.trigger(fieldsToValidate);

    if (!isStepValid) {
      return;
    }

    setIsChecking(true);

    if (step === 1) {
      const email = form.getValues('email');
      const { data: emailExists, error } = await supabase.rpc('email_exists', { email_to_check: email });
      if (error) {
        showError("Erro ao verificar o e-mail. Tente novamente.");
        setIsChecking(false);
        return;
      }
      if (emailExists) {
        form.setError('email', { type: 'manual', message: 'Este e-mail já está cadastrado.' });
        setIsChecking(false);
        return;
      }
    }

    if (step === 2) {
      const documentValue = form.getValues('cpf');
      const { data: documentExists, error } = await supabase.rpc('document_exists', { document_to_check: documentValue });
      if (error) {
        showError("Erro ao verificar o documento. Tente novamente.");
        setIsChecking(false);
        return;
      }
      if (documentExists) {
        form.setError('cpf', { type: 'manual', message: 'Este documento já está cadastrado.' });
        setIsChecking(false);
        return;
      }
    }
    
    setIsChecking(false);
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value;
    form.setValue("cep", cep);
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length === 8) {
      const addressData = await lookupCep(cleanCep);
      if (addressData) {
        form.setValue("street", addressData.logradouro);
        form.setValue("neighborhood", addressData.bairro);
        form.setValue("city", addressData.localidade);
        form.setValue("state", addressData.uf);
        showSuccess("Endereço preenchido automaticamente!");
      } else {
        showError("CEP não encontrado ou inválido.");
      }
    }
  };

  const onSubmit = async (data: SignUpFormValues) => {
    setIsSubmitting(true);
    try {
      const metadata = registrationType === 'cnpj'
        ? {
            company_name: data.firstName, // Razão Social
            cnpj: data.cpf,
            phone: data.phone,
            address_cep: data.cep,
            address_street: data.street,
            address_number: data.number,
            address_complement: data.complement,
            address_neighborhood: data.neighborhood,
            address_city: data.city,
            address_state: data.state,
            registration_type: 'cnpj',
          }
        : {
            first_name: data.firstName,
            last_name: data.lastName,
            cpf: data.cpf,
            phone: data.phone,
            address_cep: data.cep,
            address_street: data.street,
            address_number: data.number,
            address_complement: data.complement,
            address_neighborhood: data.neighborhood,
            address_city: data.city,
            address_state: data.state,
            registration_type: 'cpf',
          };

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          showError('Este e-mail já está cadastrado.');
        } else if (error.message.includes('CPF_DUPLICATE')) {
          showError('Este CPF já está cadastrado.');
        } else if (error.message.includes('CNPJ_DUPLICATE')) {
          showError('Este CNPJ já está cadastrado.');
        } else {
          showError(`Erro no cadastro: ${error.message}`);
        }
      } else if (authData.user) {
        setSignupSuccess(true);
      } else {
        throw new Error("Não foi possível completar o cadastro.");
      }
    } catch (err: any) {
      showError(`Erro inesperado: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Conta" },
    { number: 2, title: registrationType === 'cnpj' ? "Detalhes da Empresa" : "Detalhes Pessoais" },
    { number: 3, title: "Endereço" },
  ];

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-landingPage-lp-creme-terra theme-nature-vet">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-2xl">
              <CheckCircle className="h-8 w-8 mr-3 text-green-500" />
              Cadastro Quase Completo!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              Enviamos um link de confirmação para o seu e-mail.
            </p>
            <p className="text-muted-foreground">
              Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
            </p>
            <p className="font-bold text-primary">
              Confirme o e-mail para continuar.
            </p>
            <Button asChild className="w-full mt-4">
              <Link to="/login">Ir para o Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 theme-nature-vet">
      <div className="flex items-center justify-center py-12 px-4 bg-landingPage-lp-creme-terra">
        <div className="mx-auto w-full max-w-md space-y-6">
          {!registrationType ? (
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Cadastro</CardTitle>
                <CardDescription>Selecione como você deseja se cadastrar.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button onClick={() => setRegistrationType('cpf')} size="lg">
                  <UserIcon className="mr-2 h-4 w-4" /> Pessoa Física (CPF)
                </Button>
                <Button onClick={() => setRegistrationType('cnpj')} size="lg">
                  <Home className="mr-2 h-4 w-4" /> Pessoa Jurídica (CNPJ)
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setRegistrationType(null)}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Trocar tipo
                </Button>
                <div className="w-full text-center">
                  <h1 className="text-3xl font-bold text-landingPage-lp-marrom-avela">Crie sua Conta</h1>
                  <p className="text-landingPage-lp-marrom-avela/80">Preencha os campos para começar.</p>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4">
                {steps.map((s) => (
                  <div key={s.number} className="flex items-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                        step === s.number ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                        step > s.number && "bg-green-500 text-white"
                      )}
                    >
                      {step > s.number ? <CheckCircle className="h-5 w-5" /> : s.number}
                    </div>
                    <p className={cn("ml-2 font-medium", step === s.number ? "text-primary" : "text-muted-foreground")}>
                      {s.title}
                    </p>
                  </div>
                ))}
              </div>

              <Card>
                <CardContent className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {step === 1 && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem className={cn(registrationType === 'cnpj' && 'col-span-2')}><FormLabel>{registrationType === 'cnpj' ? 'Razão Social' : 'Nome'}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            {registrationType === 'cpf' && (
                              <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Sobrenome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            )}
                          </div>
                          <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    type={showPassword ? "text" : "password"}
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
                          <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar Senha</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    {...field}
                                    className="pr-10"
                                  />
                                </FormControl>
                                <div
                                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                                  onMouseDown={() => setShowConfirmPassword(true)}
                                  onMouseUp={() => setShowConfirmPassword(false)}
                                  onMouseLeave={() => setShowConfirmPassword(false)}
                                  onTouchStart={(e) => { e.preventDefault(); setShowConfirmPassword(true); }}
                                  onTouchEnd={(e) => { e.preventDefault(); setShowConfirmPassword(false); }}
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </>
                      )}
                      {step === 2 && (
                        <>
                          <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="cpf" render={({ field }) => (<FormItem><FormLabel>{registrationType === 'cnpj' ? 'CNPJ' : 'CPF'}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </>
                      )}
                      {step === 3 && (
                        <>
                          <FormField control={form.control} name="cep" render={({ field }) => (<FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} onChange={handleCepChange} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="street" render={({ field }) => (<FormItem><FormLabel>Rua</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <div className="grid grid-cols-3 gap-4">
                            <FormField control={form.control} name="number" render={({ field }) => (<FormItem className="col-span-1"><FormLabel>Nº</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="complement" render={({ field }) => (<FormItem className="col-span-2"><FormLabel>Complemento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                          <FormField control={form.control} name="neighborhood" render={({ field }) => (<FormItem><FormLabel>Bairro</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>Estado</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                        </>
                      )}
                      <div className="flex justify-between pt-4">
                        {step > 1 && <Button type="button" variant="outline" onClick={handlePrevStep}>Anterior</Button>}
                        <div className="flex-grow" />
                        {step < 3 && <Button type="button" onClick={handleNextStep} disabled={isChecking}>{isChecking ? "Verificando..." : "Próximo"}</Button>}
                        {step === 3 && <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Cadastrando..." : "Finalizar Cadastro"}</Button>}
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </>
          )}
          <p className="text-center text-sm text-landingPage-lp-marrom-avela">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
      <div className="hidden lg:flex relative flex-col items-center justify-end p-10 pb-20 text-white border-l-8 border-landingPage-lp-verde-folha-seca">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/signup-background-new.png')" }} />
        <div className="absolute inset-0 bg-black/40" />
        
        <Link to="/" className="absolute top-8 left-8 flex items-center text-white z-10">
            <PawPrint className="h-8 w-8 mr-2" />
            <span className="text-2xl font-bold">AsasVet</span>
        </Link>
        <div className="text-center space-y-4 relative z-10">
            <h1 className="text-4xl font-bold">Bem-vindo ao AsasVet</h1>
            <p className="text-lg text-white/80">
            A plataforma completa para dar asas à gestão da sua clínica veterinária.
            </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;