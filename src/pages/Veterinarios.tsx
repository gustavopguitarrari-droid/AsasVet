"use client";

import React, { useState, useEffect } from "react";
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
import TeamMemberFormDialog, { TeamMemberFormValues } from "@/components/team/TeamMemberFormDialog";
import { useLocation } from "react-router-dom";

export interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  crmv?: string | null;
  role: string;
  avatar_url?: string | null;
  organization_id?: string;
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
  const organizationId = appUser?.organizationId;
  const isAdmin = appUser?.role === "Administrador";
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState<boolean>(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState<string>("equipe");

  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isEditMemberDialogOpen, setIsEditMemberDialogOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | undefined>(undefined);

  useEffect(() => {
    if (location.state && (location.state as any).activeTab) {
      setActiveTab((location.state as any).activeTab);
    }
  }, [location.state]);

  const { data: teamMembers = [], isLoading, error } = useQuery<TeamMember[]>({
    queryKey: ['teamMembers', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, crmv, role, avatar_url, organization_id')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  const addTeamMemberMutation = useMutation({
    mutationFn: async (newMemberData: TeamMemberFormValues) => {
      if (!appUser?.id || !organizationId) throw new Error("User not authenticated or organization ID not available.");
      const session = await supabase.auth.getSession();
      if (!session.data.session) throw new Error("User not authenticated.");

      const { data: responseData, error } = await supabase.functions.invoke('create-subuser', {
        body: JSON.stringify({
          email: newMemberData.email,
          password: newMemberData.password,
          first_name: newMemberData.firstName,
          last_name: newMemberData.lastName,
          role: newMemberData.role,
          organization_id: organizationId,
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
      queryClient.invalidateQueries({ queryKey: ['teamMembers', organizationId] });
      showSuccess("Membro da equipe adicionado com sucesso!");
      setIsAddMemberDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao adicionar membro: ${err.message}`);
    },
  });

  const updateTeamMemberProfileMutation = useMutation({
    mutationFn: async (updatedMemberData: TeamMemberFormValues & { id: string }) => {
      if (!appUser?.id || !organizationId) throw new Error("User not authenticated or organization ID not available.");
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
          organization_id: organizationId,
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
      queryClient.invalidateQueries({ queryKey: ['teamMembers', organizationId] });
      showSuccess("Perfil do membro atualizado com sucesso!");
      setIsEditMemberDialogOpen(false);
      setIsDetailsDialogOpen(false);
    },
    onError: (err: any) => {
      showError(`Erro ao atualizar perfil: ${err.message}`);
    },
  });

  const deleteTeamMemberMutation = useMutation({
    mutationFn: async (memberIdToDelete: string) => {
      if (!appUser?.id || !organizationId) throw new Error("User not authenticated or organization ID not available.");
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
      queryClient.invalidateQueries({ queryKey: ['teamMembers', organizationId] });
      showSuccess("Membro da equipe excluído com sucesso!");
      setIsDetailsDialogOpen(false);
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
    setIsDetailsDialogOpen(false);
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="equipe" className="bg-primary-unselected text-primary-unselected-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">Equipe</TabsTrigger>
          <TabsTrigger value="escala" className="bg-primary-unselected text-primary-unselected-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">Escala</TabsTrigger>
        </TabsList>

        <TabsContent value="escala" className="mt-4">
          {organizationId ? (
            <CustomTeamCalendar
              veterinarians={teamMembers.filter(member => member.role === "Veterinário" || member.role === "Administrador").map(v => ({
                id: v.id,
                name: `${v.first_name} ${v.last_name}`,
                crmv: v.crmv || "N/A",
                email: v.email,
                phone: v.phone || "N/A",
                role: v.role,
                organization_id: v.organization_id,
              }))}
              organizationId={organizationId} // Passa o organizationId
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <AlertCircle className="h-5 w-5 mr-2" /> ID da organização não disponível.
            </div>
          )}
        </TabsContent>

        <TabsContent value="equipe" className="mt-4">
          <div className="p-4 border rounded-md bg-background shadow-md space-y-4 mb-4"> {/* Adicionado o fundo aqui */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <RoleFilter selectedRole={selectedRole} onSelectRole={handleSelectRole} />
              <div className="flex items-center gap-2 w-full flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar membros da equipe..."
                    className="pl-9 border border-input rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {isAdmin && ( // Apenas administradores podem adicionar membros
                  <Button onClick={() => setIsAddMemberDialogOpen(true)} className="font-bold shrink-0">
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Membro
                  </Button>
                )}
              </div>
            </div>
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
        currentUserId={appUser?.id}
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