"use client";

import React, { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope, CalendarDays } from "lucide-react";
import { CalendarEvent } from "@/components/EventCalendar";
import { TeamMember } from "@/pages/Veterinarios";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VeterinarianScheduleViewProps {
  events: CalendarEvent[];
  veterinarians: TeamMember[];
  onEventClick: (event: CalendarEvent) => void;
}

const categoryColorMap: Record<CalendarEvent["category"], string> = {
  Consulta: "hsl(var(--event-consulta))",
  Cirurgia: "hsl(var(--event-cirurgia))",
  Vacina: "hsl(var(--event-vacina))",
  Exame: "hsl(var(--event-exame))",
  Retorno: "hsl(var(--event-retorno))",
  Outros: "hsl(var(--event-outros))",
};

const VeterinarianScheduleView: React.FC<VeterinarianScheduleViewProps> = ({
  events,
  veterinarians,
  onEventClick,
}) => {
  const [selectedVetId, setSelectedVetId] = useState<string | "all">("all");

  const vetMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const vet of veterinarians) {
      map.set(vet.id, `${vet.first_name} ${vet.last_name}`);
    }
    return map;
  }, [veterinarians]);

  const filteredEvents = useMemo(() => {
    if (selectedVetId === "all") {
      return events;
    }
    return events.filter(event => event.assigned_to_id === selectedVetId);
  }, [events, selectedVetId]);

  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: CalendarEvent[] } = {};
    const sortedEvents = [...filteredEvents].sort((a, b) => {
      const dateComparison = a.date.getTime() - b.date.getTime();
      if (dateComparison !== 0) return dateComparison;
      return a.time.localeCompare(b.time);
    });

    for (const event of sortedEvents) {
      const dateKey = format(event.date, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    }
    return groups;
  }, [filteredEvents]);

  const sortedDateKeys = Object.keys(groupedEvents).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div className="w-full max-w-sm">
          <Select value={selectedVetId} onValueChange={setSelectedVetId}>
            <SelectTrigger>
              <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Selecione um veterinário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Veterinários</SelectItem>
              {veterinarians.map(vet => (
                <SelectItem key={vet.id} value={vet.id}>
                  {vet.first_name} {vet.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          {sortedDateKeys.length > 0 ? (
            <div className="space-y-6">
              {sortedDateKeys.map(dateKey => (
                <div key={dateKey}>
                  <h4 className="font-semibold text-lg mb-3 flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                    {format(new Date(dateKey + 'T00:00:00'), "PPP", { locale: ptBR })}
                  </h4>
                  <div className="space-y-2">
                    {groupedEvents[dateKey].map(event => {
                      const vetName = event.assigned_to_id ? vetMap.get(event.assigned_to_id) : null;
                      return (
                        <div
                          key={event.id}
                          onClick={() => onEventClick(event)}
                          className={cn(
                            "flex items-center space-x-3 p-3 rounded-md shadow-sm cursor-pointer transition-colors hover:bg-accent",
                            (event.status === "Cancelada" || event.status === "Realizada") && "opacity-60"
                          )}
                          style={{ borderLeft: `5px solid ${categoryColorMap[event.category]}` }}
                        >
                          <span className="font-bold text-lg">{event.time}</span>
                          <div className="flex-1">
                            <p className={cn("font-medium", (event.status === "Cancelada" || event.status === "Realizada") && "line-through")}>
                              {event.title}
                            </p>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {event.category}
                            </Badge>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            {event.status && event.status !== "Agendada" && (
                              <Badge variant={event.status === "Cancelada" ? "destructive" : "default"} className={cn(event.status === "Realizada" && "bg-green-600")}>
                                {event.status}
                              </Badge>
                            )}
                            {vetName && (
                              <span className="text-xs font-medium text-muted-foreground flex items-center">
                                <Stethoscope className="h-3 w-3 mr-1" />
                                {vetName}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum agendamento encontrado para a seleção atual.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VeterinarianScheduleView;