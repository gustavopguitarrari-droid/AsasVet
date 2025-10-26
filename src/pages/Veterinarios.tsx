"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Search, Stethoscope, User, Briefcase, GraduationCap, IdCard, HeartPulse, Edit, Trash2, AlertCircle } from "lucide-react";
import RoleFilter from "@/components/RoleFilter";
import VeterinarianDetailsDialog from "@/components/VeterinarianDetailsDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CustomTeamCalendar from "@/components/CustomTeamCalendar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { showError, showSuccess } from "@/utils/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle as AlertDialogTitleComponent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import TeamMemberFormDialog, { TeamMemberFormValues } from "@/components/team/TeamMemberFormDialog"; // Importar o novo formulário

export interface TeamMember { // Renomeado de Veterinario para TeamMember para ser mais genérico
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  crmv?: string | null;
  role: string;
  avatar_url?: string | null;
}

const roleIconMap: { [key: string]: React.ElementType } = {
  Administrador: Briefcase,
  Veterinário: Stethoscope,
  Enfermeiro: HeartPulse,
  Recepcionista: User,
  Gerente: Briefcase,
  Estagiário: GraduationCap,
  Outro: IdCard,
};

const Veterinarios = () => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;
  const isAdmin = appUser?.role === "Administrador";

  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState<boolean>(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState<string>("equipe");

  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isEditMemberDialogOpen, setIsEditMemberDialogOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | undefined>(undefined);

  // Query para buscar todos os perfis (membros da equipe)
  const { data: teamMembers = [], isLoading, error } = useQuery<TeamMember[]>({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, crmv, role, avatar_url');
      if (error) throw error;
      return data;
    },
    enabled: !!userId, // Só busca se o usuário estiver logado
  });

  // Mutação para adicionar um novo membro da equipe
  const addTeamMemberMutation = useMutation({
    mutationFn: async (newMemberData: TeamMemberFormValues) => {
      if (!userId) throw new Error("User not authenticated.");
      const session = await supabase.auth.getSession();
      if (!session.data.session) throw new Error("User not authenticated.");

      const { data: responseData, error } = await supabase.functions.invoke('create-subuser', {
        body: JSON.stringify({
          email: newMemberData.email,
          password: newMemberData.password,
          first_name: newMemberData.firstName,
          last_name: newMemberData.lastName,
          role: newMemberData.role,
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
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      showSuccess("Membro da equipe adicionado com sucesso!");
      setIsAddMemberDialogOpen(false);
    },
    onError: (err: any) => {
      showError(`Erro ao adicionar membro: ${err.message}`);
    },
  });

  // Mutação para atualizar o perfil de um membro da equipe
  const updateTeamMemberProfileMutation = useMutation({
    mutationFn: async (updatedMemberData: TeamMemberFormValues & { id: string }) => {
      if (!userId) throw new Error("User not authenticated.");
      const session = await supabase.auth.getSession();
      if (!session.data.session) throw new Error("User not authenticated.");

      const { data: responseData, error } = await supabase.functions.invoke('update-team-member-profile', {
        body: JSON.stringify({
          userIdToUpdate: updatedMemberData.id,
          first_name: updatedMemberData.firstName,
          last_name: updatedMemberData.lastName,
          email: updatedMemberData.email,
          phone: updatedMemberData.phone,
          crmv: updatedMemberData.crmv,
          role: updatedMemberData.role,
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
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      showSuccess("Perfil do membro atualizado com sucesso!");
      setIsEditMemberDialogOpen(false);
      setIsDetailsDialogOpen(false); // Fecha o diálogo de detalhes se estiver aberto
    },
    onError: (err: any) => {
      showError(`Erro ao atualizar perfil: ${err.message}`);
    },
  });

  // Mutação para deletar um membro da equipe
  const deleteTeamMemberMutation = useMutation({
    mutationFn: async (memberIdToDelete: string) => {
      if (!userId) throw new Error("User not authenticated.");
      const session = await supabase.auth.getSession();
      if (!session.data.session) throw new Error("User not authenticated.");

      const { data: responseData, error } = await supabase.functions.invoke('delete-subuser', {
        body: JSON.stringify({ userIdToDelete: memberIdToDelete }),
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
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      showSuccess("Membro da equipe excluído com sucesso!");
      setIsDetailsDialogOpen(false); // Fecha o diálogo de detalhes
    },
    onError: (err: any) => {
      showError(`Erro ao excluir membro: ${err.message}`);
    },
  });

  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
  };

  const filteredTeamMembers = teamMembers.filter((member) => {
    const matchesRole = selectedRole === "all" || member.role === selectedRole;
    const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      (member.crmv && member.crmv.toLowerCase().includes(searchTerm.toLowerCase())) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.phone && member.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleRowClick = (member: TeamMember) => {
    setSelectedTeamMember(member);
    setIsDetailsDialogOpen(true);
  };

  const handleAddMember = (data: TeamMemberFormValues) => {
    addTeamMemberMutation.mutate(data);
  };

  const handleEditMember = (member: TeamMember) => {
    setMemberToEdit(member);
    setIsEditMemberDialogOpen(true);
    setIsDetailsDialogOpen(false); // Fecha o diálogo de detalhes antes de abrir o de edição
  };

  const handleUpdateMember = (data: TeamMemberFormValues) => {
    if (!memberToEdit) return;
    updateTeamMemberProfileMutation.mutate({ ...data, id: memberToEdit.id });
  };

  const handleDeleteMember = (memberId: string, memberName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir ${memberName}? Esta ação não pode ser desfeita.`)) {
      deleteTeamMemberMutation.mutate(memberId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando membros da equipe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Erro ao carregar equipe: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        {isAdmin ? (
          <Button onClick={() => setIsAddMemberDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Membro
          </Button>
        ) : (
          <p className="text-destructive font-semibold flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" /> Apenas administradores podem adicionar membros.
          </p>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="equipe" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Equipe</TabsTrigger>
          <TabsTrigger value="escala" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Escala</TabsTrigger>
        </TabsList>

        <TabsContent value="escala" className="mt-4">
          <CustomTeamCalendar veterinarians={teamMembers.filter(member => member.role === "Veterinário").map(v => ({
            id: v.id,
            name: `${v.first_name} ${v.last_name}`,
            crmv: v.crmv || "N/A",
            email: v.email,
            phone: v.phone || "N/A",
            role: v.role,
          }))} />
        </TabsContent>

        <TabsContent value="equipe" className="mt-4">
          <RoleFilter selectedRole={selectedRole} onSelectRole={handleSelectRole} />

          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar membros da equipe..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">Filtrar</Button>
          </div>

          <div className="rounded-md border mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>CRMV</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeamMembers.length > 0 ? (
                  filteredTeamMembers.map((member) => {
                    const IconComponent = roleIconMap[member.role] || IdCard;
                    return (
                      <TableRow key={member.id} onClick={() => handleRowClick(member)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-bold">{member.first_name} {member.last_name}</TableCell>
                        <TableCell className="flex items-center">
                          <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                          {member.role}
                        </TableCell>
                        <TableCell>{member.crmv || "N/A"}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone || "N/A"}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum membro da equipe encontrado para o cargo selecionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <VeterinarianDetailsDialog
        veterinarian={selectedTeamMember ? {
          id: selectedTeamMember.id,
          name: `${selectedTeamMember.first_name} ${selectedTeamMember.last_name}`,
          crmv: selectedTeamMember.crmv || "N/A",
          email: selectedTeamMember.email,
          phone: selectedTeamMember.phone || "N/A",
          role: selectedTeamMember.role,
        } : null}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
        isAdmin={isAdmin}
        currentUserId={userId}
      />

      <TeamMemberFormDialog
        isOpen={isAddMemberDialogOpen}
        onClose={() => setIsAddMemberDialogOpen(false)}
        onSubmit={handleAddMember}
        isSubmitting={addTeamMemberMutation.isPending}
      />

      {memberToEdit && (
        <TeamMemberFormDialog
          isOpen={isEditMemberDialogOpen}
          onClose={() => setIsEditMemberDialogOpen(false)}
          onSubmit={handleUpdateMember}
          initialData={{
            id: memberToEdit.id,
            firstName: memberToEdit.first_name,
            lastName: memberToEdit.last_name,
            email: memberToEdit.email,
            phone: memberToEdit.phone || "",
            crmv: memberToEdit.crmv || "",
            role: memberToEdit.role,
          }}
          isSubmitting={updateTeamMemberProfileMutation.isPending}
        />
      )}
    </div>
  );
};

export default Veterinarios;