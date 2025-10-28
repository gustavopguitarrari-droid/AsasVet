"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarX, Trash2, Search as SearchIcon } from "lucide-react"; // Adicionado SearchIcon
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
import { Input } from "@/components/ui/input"; // Importar Input

const AgendamentosMedicos = () => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const organizationId = appUser?.organizationId; // Usar organizationId

  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = React.useState(false);
  const [defaultDateForNewEvent, setDefaultDateForNewEvent] = React.useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [isCancelConfirmDialogOpen, setIsCancelConfirmDialogOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState<string>(""); // NOVO: Estado para o termo de busca

  // Query para buscar eventos do Supabase
  const { data: events = [], isLoading, error } = useQuery<CalendarEvent[]>({
    queryKey: ['events', organizationId], // Alterado para usar organizationId
    queryFn: async () => {
      if (!organizationId) return []; // Usar organizationId
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organization_id', organizationId); // Filtrar por organization_id
      if (error) throw error;
      // Mapeia os dados do Supabase para o formato CalendarEvent
      return data.map(event => ({
        id: event.id,
        title: event.title,
        date: parseISO(event.date),
        time: event.time,
        category: event.category as CalendarEvent["category"],
        status: (event.status || "Agendada") as CalendarEvent["status"],
      }));
    },
    enabled: !!organizationId, // Habilitar query apenas se organizationId estiver disponível
  });

  // Mutação para adicionar um novo evento
  const addEventMutation = useMutation({
    mutationFn: async (newEventData: EventFormValues) => {
      if (!organizationId) throw new Error("Organization ID not available."); // Usar organizationId
      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: appUser?.id, // Manter user_id para referência do criador, mas filtrar por organization_id
          organization_id: organizationId, // NOVO: Adicionar organization_id
          title: newEventData.title,
          date: format(newEventData.date, "yyyy-MM-dd"),
          time: newEventData.time,
          category: newEventData.category,
          status: "Agendada",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', organizationId] }); // Invalida a query com organizationId
      showSuccess("Agendamento adicionado com sucesso!");
      setIsAddEventDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao adicionar agendamento: ${err.message}`);
    },
  });

  // Mutação para cancelar um evento
  const cancelEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!organizationId) throw new Error("Organization ID not available."); // Usar organizationId
      const { data, error } = await supabase
        .from('events')
        .update({ status: "Cancelada" })
        .eq('id', eventId)
        .eq('organization_id', organizationId) // Filtrar por organization_id
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', organizationId] }); // Invalida a query com organizationId
      showSuccess("Agendamento cancelado com sucesso!");
      setIsCancelConfirmDialogOpen(false);
      setSelectedEvent(null);
    },
    onError: (err) => {
      showError(`Erro ao cancelar agendamento: ${err.message}`);
    },
  });

  // NOVO: Mutação para limpar todos os eventos
  const clearAllEventsMutation = useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error("Organization ID not available."); // Usar organizationId
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('organization_id', organizationId); // Deleta todos os eventos da organização logada
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', organizationId] }); // Invalida a query com organizationId
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

  if (isLoading) {
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
      {/* Contêiner flexível para o campo de busca e os botões de ação */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 w-full"> {/* Campo de busca */}
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar agendamentos por título ou categoria..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2 shrink-0"> {/* Botões de ação */}
          <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-bold">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Agendamento</DialogTitle>
              </DialogHeader>
              <AddEventDialog onSubmit={handleAddEvent} onCancel={() => setIsAddEventDialogOpen(false)} defaultDate={defaultDateForNewEvent} />
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={events.length === 0 || clearAllEventsMutation.isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                {clearAllEventsMutation.isPending ? "Limpando..." : "Limpar Agenda"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitleComponent className="flex items-center">
                  <Trash2 className="h-5 w-5 mr-2 text-destructive" /> Confirmar Limpeza da Agenda
                </AlertDialogTitleComponent>
                <AlertDialogDescription>
                  Tem certeza que deseja limpar TODOS os agendamentos da sua agenda?
                  Esta ação não pode ser desfeita e removerá permanentemente todos os seus eventos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={clearAllEventsMutation.isPending}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAllEvents} disabled={clearAllEventsMutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {clearAllEventsMutation.isPending ? "Limpando..." : "Sim, Limpar Tudo"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <EventCalendar events={events} onAddEventClick={handleOpenDialogWithDate} onEventClick={handleEventClick} searchTerm={searchTerm} />

      {/* Diálogo de Confirmação de Cancelamento */}
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