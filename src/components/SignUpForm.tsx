"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Lock, User as UserIcon, Phone, IdCard, Home, MapPin, CheckCircle } from "lucide-react";

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
import { DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { lookupCep } from "@/utils/cepLookup";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  firstName: z.string().min(1, "O nome é obrigatório."),
  lastName: z.string().min(1, "O sobrenome é obrigatório."),
  email: z.string().email("E-mail inválido.").min(1, "O e-mail é obrigatório."),
  phone: z.string().min(1, "O telefone é obrigatório."),
  cpf: z.string()
    .min(11, "O CPF deve ter 11 dígitos.")
    .max(14, "O CPF deve ter no máximo 14 dígitos (com formatação).")
    .transform(val => val.replace(/\D/g, '')), // Remove non-digits for storage
  cep: z.string()
    .min(8, "O CEP deve ter 8 dígitos.")
    .max(9, "O CEP deve ter no máximo 9 dígitos (com formatação).")
    .transform(val => val.replace(/\D/g, '')), // Remove non-digits for lookup
  street: z.string().min(1, "A rua é obrigatória."),
  number: z.string().min(1, "O número é obrigatório."),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "O bairro é obrigatório."),
  city: z.string().min(1, "A cidade é obrigatória."),
  state: z.string().min(2, "O estado é obrigatório.").max(2, "O estado deve ter 2 letras."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  confirmPassword: z.string().min(6, "A confirmação de senha é obrigatória."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export type SignUpFormValues = z.infer<typeof formSchema>;

interface SignUpFormProps {
  onSuccess: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      cpf: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value;
    form.setValue("cep", cep); // Update form value immediately
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
        form.setValue("street", "");
        form.setValue("neighborhood", "");
        form.setValue("city", "");
        form.setValue("state", "");
      }
    }
  };

  const onSubmit = async (data: SignUpFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
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
            role: 'Veterinário', // Default role for new sign-ups
          },
        },
      });

      if (error) {
        showError(`Erro no cadastro: ${error.message}`);
      } else {
        showSuccess("Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.");
        onSuccess(); // Call the success callback
        navigate('/login'); // Redirect to login after successful signup
      }
    } catch (err: any) {
      console.error("Erro inesperado durante o cadastro:", err);
      showError(`Erro inesperado: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" /> Nome
                </FormLabel>
                <FormControl>
                  <Input placeholder="Primeiro Nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" /> Sobrenome
                </FormLabel>
                <FormControl>
                  <Input placeholder="Sobrenome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" /> E-mail
              </FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" /> Telefone
              </FormLabel>
              <FormControl>
                <Input type="tel" placeholder="(XX) XXXXX-XXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <IdCard className="h-4 w-4 mr-2 text-muted-foreground" /> CPF
              </FormLabel>
              <FormControl>
                <Input placeholder="123.456.789-00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h3 className="text-lg font-semibold mt-6 mb-4 flex items-center">
          <Home className="h-5 w-5 mr-2 text-muted-foreground" /> Endereço
        </h3>
        <FormField
          control={form.control}
          name="cep"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <Input placeholder="12345-678" {...field} onChange={handleCepChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rua</FormLabel>
              <FormControl>
                <Input placeholder="Rua das Flores" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="complement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complemento (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Apt 101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="neighborhood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input placeholder="Centro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="São Paulo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado (UF)</FormLabel>
                <FormControl>
                  <Input placeholder="SP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Lock className="h-4 w-4 mr-2 text-muted-foreground" /> Senha
              </FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Lock className="h-4 w-4 mr-2 text-muted-foreground" /> Confirmar Senha
              </FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="pt-4">
          <Button type="submit" disabled={isSubmitting}>
            <CheckCircle className="mr-2 h-4 w-4" />
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default SignUpForm;