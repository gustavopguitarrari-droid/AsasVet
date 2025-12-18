"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, User as UserIcon, Phone, IdCard, Home, MapPin, CheckCircle, PawPrint, ArrowLeft } from "lucide-react";
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
import PlanSelectionDialog from "@/components/PlanSelectionDialog";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  firstName: z.string().min(1, "O nome é obrigatório."),
  lastName: z.string().min(1, "O sobrenome é obrigatório."),
  email: z.string().email("E-mail inválido.").min(1, "O e-mail é obrigatório."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  confirmPassword: z.string().min(6, "A confirmação de senha é obrigatória."),
  phone: z.string().min(1, "O telefone é obrigatório."),
  cpf: z.string()
    .min(11, "O CPF deve ter 11 dígitos.")
    .max(14, "O CPF deve ter no máximo 14 dígitos (com formatação).")
    .transform(val => val.replace(/\D/g, '')),
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
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof formSchema>;

const SignUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlanSelectionDialogOpen, setIsPlanSelectionDialogOpen] = useState(false);
  const [newlyRegisteredUserId, setNewlyRegisteredUserId] = useState<string | null>(null);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
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
      fieldsToValidate = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
    } else if (step === 2) {
      fieldsToValidate = ['phone', 'cpf'];
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
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
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            cpf: data.cpf,
            address_cep: data.cep,
            address_street: data.street,
            address_number: data.number,
            address_complement: data.complement,
            address_neighborhood: data.neighborhood,
            address_city: data.city,
            address_state: data.state,
          },
        },
      });

      if (error) {
        showError(`Erro no cadastro: ${error.message}`);
      } else if (authData.user?.id) {
        showSuccess("Cadastro realizado com sucesso! Agora, escolha seu plano.");
        setNewlyRegisteredUserId(authData.user.id);
        setIsPlanSelectionDialogOpen(true);
      } else {
        throw new Error("Não foi possível obter o ID do usuário após o cadastro.");
      }
    } catch (err: any) {
      showError(`Erro inesperado: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlanSelected = () => {
    setIsPlanSelectionDialogOpen(false);
    navigate('/login');
  };

  const steps = [
    { number: 1, title: "Conta" },
    { number: 2, title: "Detalhes Pessoais" },
    { number: 3, title: "Endereço" },
  ];

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 theme-nature-vet">
      <div className="hidden lg:flex flex-col items-center justify-center bg-landingPage-lp-verde-folha-seca p-10 text-landingPage-lp-creme-terra">
        <Link to="/" className="absolute top-8 left-8 flex items-center">
          <PawPrint className="h-8 w-8 mr-2" />
          <span className="text-2xl font-bold">AsasVet</span>
        </Link>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Bem-vindo ao AsasVet</h1>
          <p className="text-lg text-landingPage-lp-creme-terra/80">
            A plataforma completa para dar asas à gestão da sua clínica veterinária.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 bg-landingPage-lp-creme-terra">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="lg:hidden">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
            </Link>
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
                        <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Sobrenome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>
                      <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Confirmar Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      <FormField control={form.control} name="cpf" render={({ field }) => (<FormItem><FormLabel>CPF</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                    {step < 3 && <Button type="button" onClick={handleNextStep}>Próximo</Button>}
                    {step === 3 && <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Cadastrando..." : "Finalizar Cadastro"}</Button>}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          <p className="text-center text-sm text-landingPage-lp-marrom-avela">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
      {newlyRegisteredUserId && (
        <PlanSelectionDialog
          isOpen={isPlanSelectionDialogOpen}
          onClose={() => setIsPlanSelectionDialogOpen(false)}
          userId={newlyRegisteredUserId}
          onPlanSelected={handlePlanSelected}
        />
      )}
    </div>
  );
};

export default SignUp;