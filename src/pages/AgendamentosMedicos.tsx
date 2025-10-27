"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarX, Trash2 } from "lucide-react"; // Adicionado Trash2
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

const AgendamentosMedicos = () => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;

  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = React.useState(false);
  const [defaultDateForNewEvent, setDefaultDateForNewEvent] = React.useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [isCancelConfirmDialogOpen, setIsCancelConfirmDialogOpen] = React.useState(false);

  // Query para buscar eventos do Supabase
  const { data: events = [], isLoading, error } = useQuery<CalendarEvent[]>({
    queryKey: ['events', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId);
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
    enabled: !!userId,
  });

  // Mutação para adicionar um novo evento
  const addEventMutation = useMutation({
    mutationFn: async (newEventData: EventFormValues) => {
      if (!userId) throw new Error("User not authenticated.");
      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: userId,
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
      queryClient.invalidateQueries({ queryKey: ['events', userId] });
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
      if (!userId) throw new Error("User not authenticated.");
      const { data, error } = await supabase
        .from('events')
        .update({ status: "Cancelada" })
        .eq('id', eventId)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', userId] });
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
      if (!userId) throw new Error("User not authenticated.");
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('user_id', userId); // Deleta todos os eventos do usuário logado
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', userId] });
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
      <div className="flex items-center justify-between mb-6"> {/* Novo div para os botões de ação */}
        <h2 className="text-3xl font-bold">Agenda Médica</h2> {/* Título da página */}
        <div className="flex space-x-2">
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

          {/* NOVO: Botão de Limpar Agenda */}
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

      <EventCalendar events={events} onAddEventClick={handleOpenDialogWithDate} onEventClick={handleEventClick} />

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