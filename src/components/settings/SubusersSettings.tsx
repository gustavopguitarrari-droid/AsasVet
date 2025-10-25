"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PlusCircle, User as UserIcon, Mail, Lock, Briefcase, Trash2, Edit, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import RoleSelect from "@/components/RoleSelect";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SubuserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  gender: string;
}

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
  const queryClient = useQueryClient();
  const form = useForm<SubuserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "Veterinário",
      gender: "Outro",
    },
  });

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [tempRole, setTempRole] = useState<string>("");

  // Fetch subusers
  const { data: subusers, isLoading, error } = useQuery<SubuserProfile[]>({
    queryKey: ['subusers'],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, gender')
        .neq('id', user.id); // Exclude the current admin user
      if (error) throw error;
      return data;
    },
    enabled: user?.role === "Administrador", // Only fetch if current user is admin
  });

  // Mutation for creating a subuser
  const createSubuserMutation = useMutation({
    mutationFn: async (newUserData: SubuserFormValues) => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) throw new Error("User not authenticated.");

      const { data: responseData, error } = await supabase.functions.invoke('create-subuser', {
        body: JSON.stringify({
          email: newUserData.email,
          password: newUserData.password,
          first_name: newUserData.firstName,
          last_name: newUserData.lastName,
          role: newUserData.role,
          gender: newUserData.gender,
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
      });

      if (error) throw new Error(error.message);
      if (responseData.error) throw new Error(responseData.error);
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subusers'] });
      showSuccess("Subusuário criado com sucesso!");
      form.reset();
    },
    onError: (err: any) => {
      console.error("Erro ao criar subusuário:", err.message);
      showError(`Erro ao criar subusuário: ${err.message}`);
    },
  });

  // Mutation for deleting a subuser
  const deleteSubuserMutation = useMutation({
    mutationFn: async (userIdToDelete: string) => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) throw new Error("User not authenticated.");

      const { data: responseData, error } = await supabase.functions.invoke('delete-subuser', {
        body: JSON.stringify({ userIdToDelete }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
      });

      if (error) throw new Error(error.message);
      if (responseData.error) throw new Error(responseData.error);
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subusers'] });
      showSuccess("Subusuário excluído com sucesso!");
    },
    onError: (err: any) => {
      console.error("Erro ao excluir subusuário:", err.message);
      showError(`Erro ao excluir subusuário: ${err.message}`);
    },
  });

  // Mutation for updating a subuser's role
  const updateSubuserRoleMutation = useMutation({
    mutationFn: async ({ userIdToUpdate, newRole }: { userIdToUpdate: string; newRole: string }) => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) throw new Error("User not authenticated.");

      const { data: responseData, error } = await supabase.functions.invoke('update-subuser-role', {
        body: JSON.stringify({ userIdToUpdate, newRole }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
      });

      if (error) throw new Error(error.message);
      if (responseData.error) throw new Error(responseData.error);
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subusers'] });
      showSuccess("Cargo do subusuário atualizado com sucesso!");
      setEditingUserId(null);
      setTempRole("");
    },
    onError: (err: any) => {
      console.error("Erro ao atualizar cargo:", err.message);
      showError(`Erro ao atualizar cargo: ${err.message}`);
    },
  });

  const handleCreateSubuser = (data: SubuserFormValues) => {
    createSubuserMutation.mutate(data);
  };

  const handleDeleteSubuser = (userId: string) => {
    deleteSubuserMutation.mutate(userId);
  };

  const handleEditRole = (userId: string, currentRole: string) => {
    setEditingUserId(userId);
    setTempRole(currentRole);
  };

  const handleSaveRole = (userId: string) => {
    if (tempRole && tempRole !== subusers?.find(u => u.id === userId)?.role) {
      updateSubuserRoleMutation.mutate({ userIdToUpdate: userId, newRole: tempRole });
    } else {
      setEditingUserId(null); // Cancel editing if no change or empty
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setTempRole("");
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
          <p className="text-destructive font-semibold flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" /> Você não tem permissão para acessar esta funcionalidade. Apenas administradores podem gerenciar subusuários.
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
          Aqui você pode adicionar novos subusuários para sua equipe, visualizar os existentes, e gerenciar seus cargos e acessos.
        </p>

        {/* Formulário de Criação de Subusuário */}
        <h3 className="text-xl font-semibold flex items-center">
          <PlusCircle className="h-5 w-5 mr-2" /> Criar Novo Subusuário
        </h3>
        <form onSubmit={form.handleSubmit(handleCreateSubuser)} className="space-y-4">
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
                <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" /> Gênero
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

          <Button type="submit" className="w-full" disabled={createSubuserMutation.isPending}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {createSubuserMutation.isPending ? "Criando..." : "Criar Subusuário"}
          </Button>
        </form>

        {/* Lista de Subusuários */}
        <h3 className="text-xl font-semibold mt-8 flex items-center">
          <Users className="h-5 w-5 mr-2" /> Subusuários Existentes
        </h3>
        {isLoading ? (
          <p className="text-muted-foreground">Carregando subusuários...</p>
        ) : error ? (
          <p className="text-destructive">Erro ao carregar subusuários: {error.message}</p>
        ) : subusers && subusers.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Gênero</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subusers.map((subuser) => (
                  <TableRow key={subuser.id}>
                    <TableCell className="font-medium">{subuser.first_name} {subuser.last_name}</TableCell>
                    <TableCell>{subuser.email}</TableCell>
                    <TableCell>
                      {editingUserId === subuser.id ? (
                        <div className="flex items-center space-x-2">
                          <RoleSelect
                            value={tempRole}
                            onValueChange={setTempRole}
                          />
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleSaveRole(subuser.id)} className="h-8 w-8 text-green-600 hover:bg-green-100">
                                <Check className="h-4 w-4" />
                                <span className="sr-only">Salvar</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Salvar</TooltipContent>
                          </Tooltip>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="h-8 w-8 text-destructive hover:bg-destructive-100">
                                <X className="h-4 w-4" />
                                <span className="sr-only">Cancelar</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Cancelar</TooltipContent>
                          </Tooltip>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>{subuser.role}</span>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => handleEditRole(subuser.id, subuser.role)} className="h-8 w-8 text-muted-foreground">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Editar Cargo</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">Editar Cargo</TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{subuser.gender}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={deleteSubuserMutation.isPending}>
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente o subusuário{" "}
                              <span className="font-bold">{subuser.first_name} {subuser.last_name}</span> e removerá seus dados.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSubuser(subuser.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhum subusuário encontrado.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SubusersSettings;