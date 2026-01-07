"use client";

import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, CalendarX, Stethoscope } from "lucide-react";
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
import { TeamMember } from "@/pages/Veterinarios";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  category: "Consulta" | "Cirurgia" | "Vacina" | "Exame" | "Retorno" | "Outros";
  status?: "Agendada" | "Cancelada" | "Realizada";
  assigned_to_id?: string | null; // Novo campo
}

interface EventCalendarProps {
  events: CalendarEvent[];
  onAddEventClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  searchTerm: string;
  onClearAllEvents: () => void;
  isClearingEvents: boolean;
  veterinarians: TeamMember[];
}

// Mapeamento de cores para as categorias de eventos (já definido em globals.css)
// Este mapa agora é usado para obter o nome da variável CSS
const categoryCssVarMap: Record<CalendarEvent["category"], string> = {
  Consulta: "var(--event-consulta)",
  Cirurgia: "var(--event-cirurgia)",
  Vacina: "var(--event-vacina)",
  Exame: "var(--event-exame)",
  Retorno: "var(--event-retorno)",
  Outros: "var(--event-outros)",
};

// Função auxiliar para obter o valor completo da variável CSS (hsl(var(--...)))
const getFullCssVarForCategory = (category: CalendarEvent["category"]) => {
  const cssVarName = categoryCssVarMap[category];
  return `hsl(${cssVarName})`;
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

const EventCalendar: React.FC<EventCalendarProps> = ({ events, onAddEventClick, onEventClick, searchTerm, onClearAllEvents, isClearingEvents, veterinarians }) => {
  const [selectedDay, setSelectedDay] = React.useState<Date | undefined>(new Date());

  const vetMap = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const vet of veterinarians) {
      map.set(vet.id, `${vet.first_name} ${vet.last_name}`);
    }
    return map;
  }, [veterinarians]);

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
      <Card className="flex-1 lg:max-w-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Calendário de Agendamentos</CardTitle>
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
        <CardContent className="flex-1 p-0">
          <Calendar
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            locale={ptBR}
            className="w-full h-full"
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
          />
        </CardContent>
      </Card>

      <Card className="flex-1 bg-transparent">
        <CardHeader>
          <CardTitle>
            Agendamentos para{" "}
            {selectedDay ? format(selectedDay, "PPP", { locale: ptBR }) : "Nenhum dia selecionado"}
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-transparent">
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
            <div className="space-y-3 bg-transparent">
              {eventsForSelectedDay.map((event) => {
                const isCancelled = event.status === "Cancelada";
                const isRealizada = event.status === "Realizada";
                const vetName = event.assigned_to_id ? vetMap.get(event.assigned_to_id) : null;

                return (
                  <div
                    key={event.id}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-md shadow-sm text-white",
                      (isCancelled || isRealizada) && "opacity-70"
                    )}
                    style={{ backgroundColor: getFullCssVarForCategory(event.category) }} // Aplicação do estilo inline
                  >
                    <span className="font-bold text-lg text-white">{event.time}</span>
                    <div className="flex-1">
                      <p className={cn("font-medium text-white", (isCancelled || isRealizada) && "line-through text-white/80")}>
                        {event.title}
                      </p>
                      <Badge variant="secondary" className="mt-1 text-xs bg-white/40 text-white">
                        {event.category}
                      </Badge>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {isCancelled ? (
                        <Badge variant="destructive" className="bg-red-700 text-white">
                          Cancelado
                        </Badge>
                      ) : isRealizada ? (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle className="h-3 w-3 mr-1 text-white" /> Realizada
                        </Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-white" />
                          <span className="sr-only">Cancelar Agendamento</span>
                        </Button>
                      )}
                      {vetName && (
                        <span className="text-xs font-medium text-white/80 flex items-center">
                          <Stethoscope className="h-3 w-3 mr-1" />
                          {vetName}
                        </span>
                      )}
                    </div>
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