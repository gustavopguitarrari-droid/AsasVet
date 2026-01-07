"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarX, Trash2, Search as SearchIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AddEventDialog, { EventFormValues } from "@/components/AddEventDialog";
import EventCalendar, { CalendarEvent } from "@/components/EventCalendar";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useSession } from "@/context/SessionContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import VeterinarianScheduleView from "@/components/VeterinarianScheduleView";
import { TeamMember } from "./Veterinarios";

const AgendamentosMedicos = () => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const { isLoading: isLoadingSessionContext } = useSession();
  const organizationId = appUser?.organizationId;

  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = React.useState(false);
  const [defaultDateForNewEvent, setDefaultDateForNewEvent] = React.useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [isCancelConfirmDialogOpen, setIsCancelConfirmDialogOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("agenda-geral");

  const { data: events = [], isLoading: isLoadingEvents, error } = useQuery<CalendarEvent[]>({
    queryKey: ['events', organizationId],
    queryFn: async () => {
      if (!organizationId) {
        console.log("AgendamentosMedicos: Query for events skipped, organizationId is null/undefined.");
        return [];
      }
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data.map(event => ({
        id: event.id,
        title: event.title,
        date: parseISO(event.date),
        time: event.time,
        category: event.category as CalendarEvent["category"],
        status: (event.status || "Agendada") as CalendarEvent["status"],
        assigned_to_id: event.assigned_to_id,
      }));
    },
    enabled: !!organizationId,
  });

  const { data: veterinarians = [], isLoading: isLoadingVeterinarians } = useQuery<TeamMember[]>({
    queryKey: ['teamMembersForSchedule', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, crmv, role, avatar_url, organization_id')
        .eq('organization_id', organizationId)
        .in('role', ['Veterinário', 'Administrador']);
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  const addEventMutation = useMutation({
    mutationFn: async (newEventData: EventFormValues) => {
      if (!organizationId) throw new Error("Organization ID not available.");
      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: appUser?.id,
          organization_id: organizationId,
          title: newEventData.title,
          date: format(newEventData.date, "yyyy-MM-dd"),
          time: newEventData.time,
          category: newEventData.category,
          status: "Agendada",
          assigned_to_id: newEventData.assigned_to_id === 'unassigned' ? null : newEventData.assigned_to_id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', organizationId] });
      showSuccess("Agendamento adicionado com sucesso!");
      setIsAddEventDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao adicionar agendamento: ${err.message}`);
    },
  });

  const cancelEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!organizationId) throw new Error("Organization ID not available.");
      const { data, error } = await supabase
        .from('events')
        .update({ status: "Cancelada" })
        .eq('id', eventId)
        .eq('organization_id', organizationId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', organizationId] });
      showSuccess("Agendamento cancelado com sucesso!");
      setIsCancelConfirmDialogOpen(false);
      setSelectedEvent(null);
    },
    onError: (err) => {
      showError(`Erro ao cancelar agendamento: ${err.message}`);
    },
  });

  const clearAllEventsMutation = useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error("Organization ID not available.");
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('organization_id', organizationId);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', organizationId] });
      showSuccess("Todos os agendamentos foram limpos com sucesso!");
    },
    onError: (err) => {
      showError(`Erro ao limpar agendamentos: ${err.message}`);
    },
  });

  const handleAddEvent = (data: EventFormValues) => {
    addEventMutation.mutate(data);
  };

  const handleOpenDialogWithDate = (date: Date) => {
    setDefaultDateForNewEvent(date);
    setIsAddEventDialogOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsCancelConfirmDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedEvent) {
      cancelEventMutation.mutate(selectedEvent.id);
    }
  };

  const handleClearAllEvents = () => {
    clearAllEventsMutation.mutate();
  };

  const isAddButtonDisabled = !organizationId || addEventMutation.isPending;

  if (isLoadingEvents || isLoadingSessionContext || isLoadingVeterinarians) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando agenda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Erro ao carregar agenda: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="agenda-geral" className="bg-primary-unselected text-primary-unselected-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Agenda Geral</TabsTrigger>
          <TabsTrigger value="agenda-veterinario" className="bg-primary-unselected text-primary-unselected-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Agenda por Veterinário</TabsTrigger>
        </TabsList>

        <TabsContent value="agenda-geral" className="mt-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar agendamentos por título ou categoria..."
                className="pl-9 border border-input rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2 shrink-0">
              <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button 
                      className="font-bold" 
                      disabled={isAddButtonDisabled}
                      onClick={() => setIsAddEventDialogOpen(true)}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Agendamento
                    </Button>
                  </TooltipTrigger>
                  {isAddButtonDisabled && (
                    <TooltipContent side="bottom">
                      {!organizationId ? "Informações da organização não disponíveis." : "Adicionando agendamento..."}
                    </TooltipContent>
                  )}
                </Tooltip>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Agendamento</DialogTitle>
                  </DialogHeader>
                  <AddEventDialog
                    onSubmit={handleAddEvent}
                    onCancel={() => setIsAddEventDialogOpen(false)}
                    defaultDate={defaultDateForNewEvent}
                    veterinarians={veterinarians}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <EventCalendar
            events={events}
            onAddEventClick={handleOpenDialogWithDate}
            onEventClick={handleEventClick}
            searchTerm={searchTerm}
            onClearAllEvents={handleClearAllEvents}
            isClearingEvents={clearAllEventsMutation.isPending}
            veterinarians={veterinarians}
          />
        </TabsContent>

        <TabsContent value="agenda-veterinario" className="mt-4">
          {organizationId && (
            <VeterinarianScheduleView
              events={events}
              veterinarians={veterinarians}
              onEventClick={handleEventClick}
            />
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={isCancelConfirmDialogOpen} onOpenChange={setIsCancelConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitleComponent className="flex items-center">
              <CalendarX className="h-5 w-5 mr-2 text-destructive" /> Confirmar Cancelamento
            </AlertDialogTitleComponent>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar o agendamento: <span className="font-bold">{selectedEvent?.title}</span> em{" "}
              <span className="font-bold">{selectedEvent?.date ? format(selectedEvent.date, "PPP", { locale: ptBR }) : ""}</span> às{" "}
              <span className="font-bold">{selectedEvent?.time}</span>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelEventMutation.isPending}>Não, Manter</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} disabled={cancelEventMutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {cancelEventMutation.isPending ? "Cancelando..." : "Sim, Cancelar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AgendamentosMedicos;