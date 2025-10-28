"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PlusCircle, User as UserIcon, Mail, Lock, Briefcase, Trash2, Edit, Check, X, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserContext";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import RoleSelect from "@/components/RoleSelect";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import AddSubuserDialog from "./AddSubuserDialog"; // Importar o novo diálogo

interface SubuserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  organization_id: string; // NOVO: Adicionado organization_id
}

const SubusersSettings: React.FC = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [tempRole, setTempRole] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddSubuserDialogOpen, setIsAddSubuserDialogOpen] = useState(false); // Estado para o diálogo

  // Fetch subusers
  const { data: subusers, isLoading, error } = useQuery<SubuserProfile[]>({
    queryKey: ['subusers', user?.organizationId], // Alterado para usar organizationId
    queryFn: async () => {
      if (!user?.organizationId) return []; // Usar organizationId
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, organization_id') // Gênero removido da seleção
        .eq('organization_id', user.organizationId) // Filtrar por organization_id
        .neq('id', user.id); // Exclude the current admin user
      if (error) throw error;
      return data;
    },
    enabled: user?.role === "Administrador" && !!user?.organizationId, // Only fetch if current user is admin and organizationId is available
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
      queryClient.invalidateQueries({ queryKey: ['subusers', user?.organizationId] }); // Invalida a query com organizationId
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

      console.log("Attempting to invoke update-subuser-role Edge Function...");
      const { data: responseData, error } = await supabase.functions.invoke('update-subuser-role', {
        body: JSON.stringify({ userIdToUpdate, newRole }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
      });

      console.log("Supabase Functions Invoke Raw Response:");
      console.log("  data:", responseData);
      console.log("  error:", error);

      if (error) {
        let errorMessage = error.message;
        console.error("Raw error object from invoke:", error); // Added log
        if (error.context && error.context.data) {
          console.error("error.context.data:", error.context.data); // Added log
          try {
            const errorData = JSON.parse(error.context.data);
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (parseError) {
            console.error("Failed to parse Edge Function error response context data:", parseError);
          }
        }
        console.error("Error from supabase.functions.invoke:", errorMessage);
        throw new Error(errorMessage);
      }
      
      // If no error from invoke, check if the Edge Function itself returned an error in its body (status 200 with error payload)
      if (responseData && responseData.error) {
        console.error("Error reported by Edge Function in 200 response:", responseData.error);
        throw new Error(responseData.error);
      }

      console.log("Edge Function invocation successful. Returning data:", responseData);
      return responseData;
    },
    onSuccess: () => {
      console.log("updateSubuserRoleMutation: onSuccess callback triggered.");
      queryClient.invalidateQueries({ queryKey: ['subusers', user?.organizationId] }); // Invalida a query com organizationId
      showSuccess("Cargo do subusuário atualizado com sucesso!");
      setEditingUserId(null);
      setTempRole("");
    },
    onError: (err: any) => {
      console.error("updateSubuserRoleMutation: onError callback triggered. Full error object:", err);
      showError(`Erro ao atualizar cargo: ${err.message || "Erro desconhecido."}`);
    },
  });

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

  const handleSubuserCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['subusers', user?.organizationId] }); // Invalida a query para atualizar a lista
  };

  const filteredSubusers = subusers?.filter(subuser =>
    subuser.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subuser.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subuser.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subuser.role.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

        {/* Botão para abrir o diálogo de criação de subusuário */}
        <div className="flex justify-end">
          <Button onClick={() => setIsAddSubuserDialogOpen(true)} className="font-bold">
            <PlusCircle className="mr-2 h-4 w-4" /> Criar Novo Subusuário
          </Button>
        </div>

        {/* Lista de Subusuários - Ocupa uma linha inteira */}
        <div className="space-y-6 p-4 border rounded-md bg-card shadow-sm">
          <h3 className="text-xl font-semibold flex items-center">
            <Users className="h-5 w-5 mr-2" /> Subusuários Existentes
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar subusuários..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando subusuários...</p>
          ) : error ? (
            <p className="text-destructive">Erro ao carregar subusuários: {error.message}</p>
          ) : filteredSubusers.length > 0 ? (
            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Cargo</TableHead>
                    {/* Gênero removido */}
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubusers.map((subuser) => (
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
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleSaveRole(subuser.id)}
                                  className="h-8 w-8 text-green-600 hover:bg-green-100"
                                  disabled={updateSubuserRoleMutation.isPending} // Desabilita durante o carregamento
                                >
                                  {updateSubuserRoleMutation.isPending ? (
                                    <span className="loading-spinner h-4 w-4" /> // Placeholder para spinner
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}
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
                                <Button variant="secondary" size="icon" onClick={() => handleEditRole(subuser.id, subuser.role)} className="h-8 w-8">
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Editar Cargo</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Editar Cargo</TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </TableCell>
                      {/* Gênero removido */}
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
            </ScrollArea>
          ) : (
            <p className="text-muted-foreground text-center py-4">Nenhum subusuário encontrado.</p>
          )}
        </div>
      </CardContent>

      <AddSubuserDialog
        isOpen={isAddSubuserDialogOpen}
        onClose={() => setIsAddSubuserDialogOpen(false)}
        onSubuserCreated={handleSubuserCreated}
      />
    </Card>
  );
};

export default SubusersSettings;