"use client";

import React from "react";
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
import { PlusCircle, Search, CalendarCheck, CalendarX, CalendarClock, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, Play, History } from "lucide-react"; // Adicionado History
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AppointmentForm, { AppointmentFormValues } from "@/components/AppointmentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AppointmentDetailsDialog from "@/components/AppointmentDetailsDialog";
import AppointmentChronometer from "@/components/AppointmentChronometer";
import AppointmentHistoryDialog from "@/components/AppointmentHistoryDialog"; // Importar o novo diálogo
import { format, parseISO } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { showError, showSuccess } from "@/utils/toast";
import { Client, Pet } from "@/types/cadastro"; // Import Client and Pet interfaces

export interface Appointment {
  id: string;
  user_id: string; // Adicionado para RLS
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  client_name: string; // Renomeado para corresponder ao DB
  pet_name: string; // Renomeado para corresponder ao DB
  species: string;
  service: string;
  veterinarian: string;
  status: "Agendada" | "Realizada" | "Cancelada" | "Em Andamento";
  completion_date?: string | null; // Renomeado para corresponder ao DB
  completion_time?: string | null; // Renomeado para corresponder ao DB
  created_at: string; // Adicionado para corresponder ao DB
}

// Mapeamento de espécies para ícones
const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
};

const Appointments = () => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;
  const veterinarianName = appUser?.name || "Veterinário Desconhecido"; // Nome do veterinário logado

  const [activeTab, setActiveTab] = React.useState<string>("em-espera");
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = React.useState<boolean>(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = React.useState<boolean>(false); // Novo estado para o histórico

  // --- Queries ---
  const { data: appointments = [], isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['appointments', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch history appointments (Realizada ou Cancelada)
  const { data: historyAppointments = [], isLoading: isLoadingHistory, error: historyError } = useQuery<Appointment[]>({
    queryKey: ['historyAppointments', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['Realizada', 'Cancelada']); // Filtra por status
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch clients
  const { data: clients = [], isLoading: isLoadingClients, error: clientsError } = useQuery<Client[]>({
    queryKey: ['clients', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data.map(dbClient => ({
        id: dbClient.id,
        name: dbClient.name,
        email: dbClient.email,
        phone: dbClient.phone,
        cpf: dbClient.cpf,
        dateOfBirth: dbClient.date_of_birth,
        address: {
          cep: dbClient.address_cep || '',
          street: dbClient.address_street || '',
          number: dbClient.address_number || '',
          complement: dbClient.address_complement || undefined,
          neighborhood: dbClient.address_neighborhood || '',
          city: dbClient.address_city || '',
          state: dbClient.address_state || '',
        },
        observations: dbClient.observations || undefined,
        photoUrl: dbClient.photo_url || undefined,
      }));
    },
    enabled: !!userId,
  });

  // Fetch pets
  const { data: pets = [], isLoading: isLoadingPets, error: petsError } = useQuery<Pet[]>({
    queryKey: ['pets', userId],
    queryFn: async () => {
      if (!userId) return [];
      // RLS on 'pets' table ensures only pets belonging to the user's clients are returned
      const { data, error } = await supabase
        .from('pets')
        .select('*');
      if (error) throw error;
      // Mapeia owner_id para ownerId para corresponder à interface Pet
      return data.map(dbPet => ({
        id: dbPet.id,
        name: dbPet.name,
        species: dbPet.species,
        breed: dbPet.breed,
        age: dbPet.age,
        gender: dbPet.gender,
        color: dbPet.color,
        observations: dbPet.observations || undefined,
        photoUrl: dbPet.photo_url || undefined,
        ownerId: dbPet.owner_id, // CORREÇÃO AQUI: Mapeando owner_id para ownerId
      }));
    },
    enabled: !!userId,
  });

  // --- Mutations ---
  const addAppointmentMutation = useMutation({
    mutationFn: async (newAppointmentData: AppointmentFormValues) => {
      if (!userId) throw new Error("User not authenticated.");

      // A data agora é sempre um objeto Date do formulário, formatamos para string
      const appointmentDate = format(newAppointmentData.date, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          user_id: userId,
          date: appointmentDate,
          time: newAppointmentData.time,
          client_name: newAppointmentData.client,
          pet_name: newAppointmentData.pet,
          species: newAppointmentData.species,
          service: newAppointmentData.service,
          veterinarian: veterinarianName, // CORREÇÃO AQUI: Usando o nome do veterinário logado
          status: "Agendada", // Status inicial é "Agendada"
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
      showSuccess("Consulta agendada com sucesso!");
      setIsAddAppointmentDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao agendar consulta: ${err.message}`);
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async (updatedAppointment: Appointment) => {
      if (!userId) throw new Error("User not authenticated.");
      const { data, error } = await supabase
        .from('appointments')
        .update({
          date: updatedAppointment.date,
          time: updatedAppointment.time,
          client_name: updatedAppointment.client_name,
          pet_name: updatedAppointment.pet_name,
          species: updatedAppointment.species,
          service: updatedAppointment.service,
          veterinarian: updatedAppointment.veterinarian,
          status: updatedAppointment.status,
          completion_date: updatedAppointment.completion_date,
          completion_time: updatedAppointment.completion_time,
        })
        .eq('id', updatedAppointment.id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
      queryClient.invalidateQueries({ queryKey: ['historyAppointments', userId] }); // Invalida o histórico também
      showSuccess("Consulta atualizada com sucesso!");
      setIsDetailsDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao atualizar consulta: ${err.message}`);
    },
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!userId) throw new Error("User not authenticated.");
      const now = new Date();
      const { data, error } = await supabase
        .from('appointments')
        .update({
          status: "Cancelada",
          completion_date: format(now, "yyyy-MM-dd"),
          completion_time: format(now, "HH:mm"),
        })
        .eq('id', appointmentId)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
      queryClient.invalidateQueries({ queryKey: ['historyAppointments', userId] }); // Invalida o histórico também
      showSuccess("Consulta cancelada com sucesso!");
      setIsDetailsDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao cancelar consulta: ${err.message}`);
    },
  });

  const startAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!userId) throw new Error("User not authenticated.");
      if (!appUser?.name) throw new Error("User name not available to assign as veterinarian.");

      const { data, error } = await supabase
        .from('appointments')
        .update({
          status: "Em Andamento",
          veterinarian: appUser.name, // Atribui o veterinário logado
        })
        .eq('id', appointmentId)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
      showSuccess("Consulta iniciada com sucesso!");
      setActiveTab("em-andamento"); // Muda para a aba "Em Andamento"
    },
    onError: (err) => {
      showError(`Erro ao iniciar consulta: ${err.message}`);
    },
  });

  const handleAddAppointment = (data: AppointmentFormValues) => {
    addAppointmentMutation.mutate(data);
  };

  const handleUpdateAppointment = (updatedAppointment: Appointment) => {
    updateAppointmentMutation.mutate(updatedAppointment);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    cancelAppointmentMutation.mutate(appointmentId);
  };

  const handleStartAppointment = (appointmentId: string) => {
    startAppointmentMutation.mutate(appointmentId);
  };

  const handleRowClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };

  const handleViewHistoryDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsHistoryDialogOpen(false); // Fecha o histórico
    setIsDetailsDialogOpen(true); // Abre os detalhes
  };

  const getStatusBadgeVariant = (status: Appointment["status"]) => {
    switch (status) {
      case "Agendada":
        return "bg-primary text-primary-foreground";
      case "Em Andamento":
        return "bg-orange-500 text-white";
      case "Realizada":
        return "bg-green-500 text-white";
      case "Cancelada":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    let matchesTab = false;
    switch (activeTab) {
      case "em-espera":
        matchesTab = appointment.status === "Agendada";
        break;
      case "em-andamento":
        matchesTab = appointment.status === "Em Andamento";
        break;
      case "finalizadas":
        matchesTab = appointment.status === "Realizada" || appointment.status === "Cancelada";
        break;
      default:
        matchesTab = true;
        break;
    }
    const matchesSearch =
      appointment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.pet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.veterinarian && appointment.veterinarian.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const totalAgendadas = appointments.filter(a => a.status === "Agendada").length;
  const totalRealizadas = appointments.filter(a => a.status === "Realizada").length;
  const totalCanceladas = appointments.filter(a => a.status === "Cancelada").length;
  const totalEmAndamento = appointments.filter(a => a.status === "Em Andamento").length;

  if (isLoading || isLoadingClients || isLoadingPets || isLoadingHistory) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando consultas e dados de cadastro...</p>
      </div>
    );
  }

  if (error || clientsError || petsError || historyError) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Erro ao carregar dados: {error?.message || clientsError?.message || petsError?.message || historyError?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Gerenciar consultas do dia</h2>
        <div className="flex space-x-2"> {/* Container para os botões */}
          <Button onClick={() => setIsHistoryDialogOpen(true)} variant="outline">
            <History className="mr-2 h-4 w-4" /> Ver Histórico
          </Button>
          <Dialog open={isAddAppointmentDialogOpen} onOpenChange={setIsAddAppointmentDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar consulta a fila
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[60vh] overflow-y-auto p-6">
              <DialogHeader>
                <DialogTitle>Incluir Nova Consulta</DialogTitle>
              </DialogHeader>
              <AppointmentForm
                onSubmit={handleAddAppointment}
                allClients={clients}
                allPets={pets}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gray-700 text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em espera</CardTitle>
            <CalendarClock className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgendadas}</div>
            <p className="text-gray-200 text-xs">Consultas aguardando</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500 text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <CalendarClock className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmAndamento}</div>
            <p className="text-white/80 text-xs">Consultas em progresso</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500 text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realizadas</CardTitle>
            <CalendarCheck className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRealizadas}</div>
            <p className="text-white/80 text-xs">Consultas concluídas</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive text-destructive-foreground shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            <CalendarX className="h-4 w-4 text-destructive-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCanceladas}</div>
            <p className="text-destructive-foreground/80 text-xs">Consultas canceladas</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="em-espera" className="data-[state=active]:bg-gray-500 data-[state=active]:text-white">Em Espera</TabsTrigger>
            <TabsTrigger value="em-andamento" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Em Andamento</TabsTrigger>
            <TabsTrigger value="finalizadas" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Finalizadas</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar consultas..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>Serviço</TableHead>
              {activeTab === "em-espera" && <TableHead>Tempo de Espera</TableHead>}
              {activeTab === "em-andamento" && <TableHead>Veterinário</TableHead>}
              {activeTab === "em-andamento" && <TableHead>Tempo de Consulta</TableHead>}
              {activeTab === "finalizadas" && <TableHead>Veterinário</TableHead>}
              {activeTab === "finalizadas" && <TableHead>Data Finalização</TableHead>}
              {activeTab === "finalizadas" && <TableHead>Hora Finalização</TableHead>}
              <TableHead className="text-right">Ações</TableHead> {/* Adicionada coluna de Ações */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => {
                const IconComponent = speciesIconMap[appointment.species] || MoreHorizontal;
                const isCancelled = activeTab === "finalizadas" && appointment.status === "Cancelada";
                const isRealizada = activeTab === "finalizadas" && appointment.status === "Realizada";
                const isEmAndamento = activeTab === "em-andamento" && appointment.status === "Em Andamento";
                return (
                  <TableRow
                    key={appointment.id}
                    onClick={() => handleRowClick(appointment)}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50"
                    )}
                  >
                    <TableCell className="font-medium flex items-center">
                      <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                      {appointment.pet_name}
                    </TableCell>
                    <TableCell>{appointment.client_name}</TableCell>
                    <TableCell>{appointment.service}</TableCell>
                    {activeTab === "em-espera" && (
                      <TableCell>
                        <AppointmentChronometer date={appointment.date} time={appointment.time} />
                      </TableCell>
                    )}
                    {activeTab === "em-andamento" && (
                      <>
                        <TableCell className="flex items-center">
                          {appointment.veterinarian || "N/A"}
                          <Badge className={cn("ml-2", getStatusBadgeVariant("Em Andamento"))}>
                            Iniciada
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <AppointmentChronometer date={appointment.date} time={appointment.time} />
                        </TableCell>
                      </>
                    )}
                    {activeTab === "finalizadas" && (
                      <>
                        <TableCell className="flex items-center">
                          {appointment.veterinarian || "N/A"}
                          {isCancelled && (
                            <Badge className={cn("ml-2", getStatusBadgeVariant("Cancelada"))}>
                              Cancelada
                            </Badge>
                          )}
                          {isRealizada && (
                            <Badge className={cn("ml-2", getStatusBadgeVariant("Realizada"))}>
                              Concluída
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{appointment.completion_date || "N/A"}</TableCell>
                        <TableCell>{appointment.completion_time || "N/A"}</TableCell>
                      </>
                    )}
                    <TableCell className="text-right">
                      {activeTab === "em-espera" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Evita que o clique na linha abra o diálogo de detalhes
                            handleStartAppointment(appointment.id);
                          }}
                          disabled={startAppointmentMutation.isPending}
                        >
                          <Play className="mr-2 h-4 w-4" /> Iniciar
                        </Button>
                      )}
                      {/* Outras ações (editar/cancelar) serão tratadas no AppointmentDetailsDialog */}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={activeTab === "em-andamento" ? 6 : (activeTab === "finalizadas" ? 8 : 5)} className="h-24 text-center">
                  Nenhuma consulta encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        onUpdate={handleUpdateAppointment}
        onCancelAppointment={handleCancelAppointment}
        onStartAppointment={handleStartAppointment} // Passa a função de iniciar consulta
      />

      <AppointmentHistoryDialog
        isOpen={isHistoryDialogOpen}
        onClose={() => setIsHistoryDialogOpen(false)}
        historyAppointments={historyAppointments}
        onViewDetails={handleViewHistoryDetails}
      />
    </div>
  );
};

export default Appointments;