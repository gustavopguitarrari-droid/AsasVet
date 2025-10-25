"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PlusCircle, User as UserIcon, Mail, Lock, Briefcase, Venus, Mars } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import RoleSelect from "@/components/RoleSelect"; // Reutilizar RoleSelect
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Para o gênero

const formSchema = z.object({
  firstName: z.string().min(1, "O nome é obrigatório."),
  lastName: z.string().min(1, "O sobrenome é obrigatório."),
  email: z.string().email("E-mail inválido.").min(1, "O e-mail é obrigatório."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  role: z.string().min(1, "O cargo é obrigatório."),
  gender: z.enum(["Masculino", "Feminino", "Outro"], {
    required_error: "O gênero é obrigatório.",
  }),
});

type SubuserFormValues = z.infer<typeof formSchema>;

const SubusersSettings: React.FC = () => {
  const { user } = useUser();
  const form = useForm<SubuserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "Veterinário", // Default role
      gender: "Outro", // Default gender
    },
  });

  const onSubmit = async (data: SubuserFormValues) => {
    if (user?.role !== "Administrador") {
      showError("Você não tem permissão para criar subusuários.");
      return;
    }

    try {
      const { data: responseData, error } = await supabase.functions.invoke('create-subuser', {
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role,
          gender: data.gender,
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await supabase.auth.getSession().then(res => res.data.session?.access_token)}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }
      if (responseData.error) {
        throw new Error(responseData.error);
      }

      showSuccess("Subusuário criado com sucesso!");
      form.reset();
    } catch (error: any) {
      console.error("Erro ao criar subusuário:", error.message);
      showError(`Erro ao criar subusuário: ${error.message}`);
    }
  };

  if (user?.role !== "Administrador") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" /> Gerenciar Subusuários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-destructive font-semibold">
            Você não tem permissão para acessar esta funcionalidade. Apenas administradores podem gerenciar subusuários.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" /> Gerenciar Subusuários
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          Aqui você pode adicionar novos subusuários para sua equipe e definir seus cargos.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" /> Nome
              </Label>
              <Input id="firstName" placeholder="Primeiro Nome" {...form.register("firstName")} />
              {form.formState.errors.firstName && (
                <p className="text-destructive text-sm">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" /> Sobrenome
              </Label>
              <Input id="lastName" placeholder="Sobrenome" {...form.register("lastName")} />
              {form.formState.errors.lastName && (
                <p className="text-destructive text-sm">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" /> E-mail
            </Label>
            <Input id="email" type="email" placeholder="email@exemplo.com" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center">
              <Lock className="h-4 w-4 mr-2 text-muted-foreground" /> Senha
            </Label>
            <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} />
            {form.formState.errors.password && (
              <p className="text-destructive text-sm">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center">
                <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" /> Cargo
              </Label>
              <RoleSelect
                value={form.watch("role")}
                onValueChange={(value) => form.setValue("role", value)}
              />
              {form.formState.errors.role && (
                <p className="text-destructive text-sm">{form.formState.errors.role.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender" className="flex items-center">
                <Venus className="h-4 w-4 mr-2 text-muted-foreground" /> Gênero
              </Label>
              <Select
                onValueChange={(value) => form.setValue("gender", value as "Masculino" | "Feminino" | "Outro")}
                defaultValue={form.watch("gender")}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.gender && (
                <p className="text-destructive text-sm">{form.formState.errors.gender.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {form.formState.isSubmitting ? "Criando..." : "Criar Subusuário"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubusersSettings;