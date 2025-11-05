"use client";

import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, CalendarX } from "lucide-react"; // Importar CalendarX para o AlertDialog
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
} from "@/components/ui/alert-dialog"; // Importar AlertDialog

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  category: "Consulta" | "Cirurgia" | "Vacina" | "Exame" | "Retorno" | "Outros";
  status?: "Agendada" | "Cancelada" | "Realizada"; // Adicionado status "Realizada"
}

interface EventCalendarProps {
  events: CalendarEvent[];
  onAddEventClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  searchTerm: string;
  onClearAllEvents: () => void; // NOVO: Prop para limpar todos os eventos
  isClearingEvents: boolean; // NOVO: Prop para indicar se a limpeza está em andamento
}

const categoryColorMap: Record<CalendarEvent["category"], string> = {
  Consulta: "bg-event-consulta",
  Cirurgia: "bg-event-cirurgia",
  Vacina: "bg-event-vacina",
  Exame: "bg-event-exame",
  Retorno: "bg-event-retorno",
  Outros: "bg-event-outros",
};

// Definição das categorias para a legenda
const eventCategories = [
  { name: "Consulta", value: "Consulta", colorClass: "bg-event-consulta" },
  { name: "Cirurgia", value: "Cirurgia", colorClass: "bg-event-cirurgia" },
  { name: "Vacina", value: "Vacina", colorClass: "bg-event-vacina" },
  { name: "Exame", value: "Exame", colorClass: "bg-event-exame" },
  { name: "Retorno", value: "Retorno", colorClass: "bg-event-retorno" },
  { name: "Outros", value: "Outros", colorClass: "bg-event-outros" },
];

const EventCalendar: React.FC<EventCalendarProps> = ({ events, onAddEventClick, onEventClick, searchTerm, onClearAllEvents, isClearingEvents }) => {
  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(new Date());

  const eventsForSelectedDay = React.useMemo(() => {
    if (!selectedDay) return [];
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return events
      .filter((event) => isSameDay(event.date, selectedDay))
      .filter((event) =>
        event.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        event.category.toLowerCase().includes(lowerCaseSearchTerm) ||
        event.time.includes(lowerCaseSearchTerm)
      )
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [events, selectedDay, searchTerm]);

  const modifiers = {
    events: events.map((event) => event.date),
  };

  const modifiersClassNames = {
    events: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary",
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <Card className="flex-1 lg:max-w-[600px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> {/* Ajustado para flex-row */}
          <CardTitle>Calendário de Agendamentos</CardTitle>
          {/* NOVO: Botão de Limpar Agenda */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={events.length === 0 || isClearingEvents}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isClearingEvents ? "Limpando..." : "Limpar Agenda"}
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
                <AlertDialogCancel disabled={isClearingEvents}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onClearAllEvents} disabled={isClearingEvents} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isClearingEvents ? "Limpando..." : "Sim, Limpar Tudo"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            locale={ptBR}
            className="rounded-md border shadow-md w-full"
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
          />
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>
            Agendamentos para{" "}
            {selectedDay ? format(selectedDay, "PPP", { locale: ptBR }) : "Nenhum dia selecionado"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Legenda de Cores */}
          <div className="flex flex-wrap gap-2 mb-4">
            {eventCategories.map((category) => (
              <div key={category.value} className="flex items-center space-x-1">
                <span className={cn("h-3 w-3 rounded-full", category.colorClass)}></span>
                <span className="text-xs text-muted-foreground">{category.name}</span>
              </div>
            ))}
          </div>

          {eventsForSelectedDay.length > 0 ? (
            <div className="space-y-3">
              {eventsForSelectedDay.map((event) => {
                const isCancelled = event.status === "Cancelada";
                const isRealizada = event.status === "Realizada";

                return (
                  <div
                    key={event.id}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-md shadow-sm", // Removido text-white daqui
                      categoryColorMap[event.category],
                      (isCancelled || isRealizada) && "opacity-70"
                    )}
                  >
                    <span className="font-bold text-lg text-foreground">{event.time}</span> {/* Adicionado text-foreground */}
                    <div className="flex-1">
                      <p className={cn("font-medium text-foreground", (isCancelled || isRealizada) && "line-through text-muted-foreground")}> {/* Adicionado text-foreground */}
                        {event.title}
                      </p>
                      <Badge variant="secondary" className="mt-1 text-xs bg-white/40 text-foreground"> {/* Alterado para bg-white/40 e text-foreground */}
                        {event.category}
                      </Badge>
                    </div>
                    {isCancelled ? (
                      <Badge variant="destructive" className="bg-red-700 text-white">
                        Cancelado
                      </Badge>
                    ) : isRealizada ? (
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" /> Realizada
                      </Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-foreground hover:bg-foreground/20" {/* Alterado para text-foreground */}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Cancelar Agendamento</span>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum agendamento para este dia.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventCalendar;