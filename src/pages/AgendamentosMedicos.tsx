"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AddEventDialog, { EventFormValues } from "@/components/AddEventDialog";
import EventCalendar, { CalendarEvent } from "@/components/EventCalendar";
import { format } from "date-fns";

const AgendamentosMedicos = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [defaultDateForNewEvent, setDefaultDateForNewEvent] = React.useState<Date | undefined>(undefined);

  // Mock de eventos iniciais para demonstração
  React.useEffect(() => {
    const mockEvents: CalendarEvent[] = [
      { id: "E001", title: "Consulta Rex", date: new Date(2024, 9, 28), time: "10:00", category: "Consulta" },
      { id: "E002", title: "Vacina Miau", date: new Date(2024, 9, 28), time: "14:30", category: "Vacina" },
      { id: "E003", title: "Cirurgia Pingo", date: new Date(2024, 9, 29), time: "09:00", category: "Cirurgia" },
      { id: "E004", title: "Exame Bob", date: new Date(2024, 10, 5), time: "11:00", category: "Exame" },
      { id: "E005", title: "Retorno Luna", date: new Date(2024, 10, 5), time: "16:00", category: "Retorno" },
    ];
    setEvents(mockEvents);
  }, []);

  const handleAddEvent = (data: EventFormValues) => {
    const newEvent: CalendarEvent = {
      id: `E${(events.length + 1).toString().padStart(3, '0')}`,
      title: data.title,
      date: data.date,
      time: data.time,
      category: data.category,
    };
    setEvents((prevEvents) => [...prevEvents, newEvent]);
    setIsDialogOpen(false);
  };

  const handleOpenDialogWithDate = (date: Date) => {
    setDefaultDateForNewEvent(date);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Agenda</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialogWithDate(new Date())}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Agendamento</DialogTitle>
            </DialogHeader>
            <AddEventDialog onSubmit={handleAddEvent} onCancel={() => setIsDialogOpen(false)} defaultDate={defaultDateForNewEvent} />
          </DialogContent>
        </Dialog>
      </div>

      <EventCalendar events={events} onAddEventClick={handleOpenDialogWithDate} />
    </div>
  );
};

export default AgendamentosMedicos;