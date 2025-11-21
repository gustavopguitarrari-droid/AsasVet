"use client";

import React, { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";
import EventCalendar, { CalendarEvent } from "@/components/EventCalendar";
import { TeamMember } from "@/pages/Veterinarios";

interface VeterinarianScheduleViewProps {
  events: CalendarEvent[];
  veterinarians: TeamMember[];
  onAddEventClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const VeterinarianScheduleView: React.FC<VeterinarianScheduleViewProps> = ({
  events,
  veterinarians,
  onAddEventClick,
  onEventClick,
}) => {
  const [selectedVetId, setSelectedVetId] = useState<string | "all">("all");

  const filteredEvents = useMemo(() => {
    if (selectedVetId === "all") {
      return events;
    }
    return events.filter(event => event.assigned_to_id === selectedVetId);
  }, [events, selectedVetId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Agenda por Veterinário</h3>
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

      <EventCalendar
        events={filteredEvents}
        onAddEventClick={onAddEventClick}
        onEventClick={onEventClick}
        searchTerm="" // A busca principal não se aplica aqui, o filtro é pelo select
        onClearAllEvents={() => {}} // A limpeza geral não deve ser feita nesta view
        isClearingEvents={false}
      />
    </div>
  );
};

export default VeterinarianScheduleView;