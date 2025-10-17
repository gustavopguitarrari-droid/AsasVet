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
import { PlusCircle, Search, CalendarCheck, CalendarX, CalendarClock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AppointmentForm from "@/components/AppointmentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AppointmentDetailsDialog from "@/components/AppointmentDetailsDialog"; // Importar o novo diálogo

interface Appointment {
  id: string;
  date: string;
  time: string;
  client: string;
  pet: string;
  service: string;
  veterinarian: string;
  status: "Agendada" | "Realizada" | "Cancelada";
}

const mockAppointments: Appointment[] = [
  { id: "C001", date: "2024-10-26", time: "10:00", client: "João Silva", pet: "Rex", service: "Consulta Geral", veterinarian: "Dr. Ana Paula", status: "Agendada" },
  { id: "C002", date: "2024-10-26", time: "14:30", client: "Maria Souza", pet: "Miau", service: "Vacinação", veterinarian: "Dr. Carlos Eduardo", status: "Realizada" },
  { id: "C003", date: "2024-10-27", time: "09:00", client: "Pedro Santos", pet: "Pingo", service: "Exame de Rotina", veterinarian: "Dra. Beatriz Lima", status: "Cancelada" },
  { id: "C004", date: "2024-10-28", time: "11:00", client: "Ana Costa", pet: "Bob", service: "Banho e Tosa", veterinarian: "Dr. Ana Paula", status: "Agendada" },
  { id: "C005", date: "2024-10-29", time: "16:00", client: "Carlos Lima", pet: "Luna", service: "Consulta de Retorno", veterinarian: "Dr. Carlos Eduardo", status: "Agendada" },
  { id: "C006", date: "2024-10-25", time: "13:00", client: "Fernanda Reis", pet: "Thor", service: "Cirurgia", veterinarian: "Dra. Beatriz Lima", status: "Realizada" },
];

const Appointments = () => {
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState<boolean>(false); // Renomeado para clareza
  const [appointments, setAppointments] = React.useState<Appointment[]>(mockAppointments);
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesTab = activeTab === "all" || appointment.status === activeTab;
    const matchesSearch =
      appointment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.pet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.veterinarian.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleAddAppointment = (newAppointmentData: Omit<Appointment, "id">) => {
    const newId = `C${(appointments.length + 1).toString().padStart(3, '0')}`;
    setAppointments((prev) => [...prev, { id: newId, ...newAppointmentData }]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateAppointment = (updatedAppointment: Appointment) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === updatedAppointment.id ? updatedAppointment : app))
    );
  };

  const handleCancelAppointment = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === appointmentId ? { ...app, status: "Cancelada" } : app
      )
    );
  };

  const handleRowClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: Appointment["status"]) => {
    switch (status) {
      case "Agendada":
        return "bg-sidebar-item-bg-1 text-white"; // Azul para agendada
      case "Realizada":
        return "bg-green-500 text-white"; // Verde para realizada
      case "Cancelada":
        return "bg-destructive text-white"; // Vermelho para cancelada
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const totalAgendadas = appointments.filter(a => a.status === "Agendada").length;
  const totalRealizadas = appointments.filter(a => a.status === "Realizada").length;
  const totalCanceladas = appointments.filter(a => a.status === "Cancelada").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Consultas</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Agendar Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agendar Nova Consulta</DialogTitle>
            </DialogHeader>
            <AppointmentForm onSubmit={handleAddAppointment} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-sidebar-item-bg-1 text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
            <CalendarClock className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgendadas}</div>
            <p className="text-white/80 text-xs">Consultas pendentes</p>
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
        <Card className="bg-destructive text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            <CalendarX className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCanceladas}</div>
            <p className="text-white/80 text-xs">Consultas canceladas</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-2">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar consultas..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Todas</TabsTrigger>
            <TabsTrigger value="Agendada" className="data-[state=active]:bg-sidebar-item-bg-1 data-[state=active]:text-white">Agendadas</TabsTrigger>
            <TabsTrigger value="Realizada" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Realizadas</TabsTrigger>
            <TabsTrigger value="Cancelada" className="data-[state=active]:bg-destructive data-[state=active]:text-white">Canceladas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Veterinário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id} onClick={() => handleRowClick(appointment)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{appointment.pet}</TableCell>
                  <TableCell>{appointment.client}</TableCell>
                  <TableCell>{appointment.service}</TableCell>
                  <TableCell>{appointment.veterinarian}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeVariant(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
      />
    </div>
  );
};

export default Appointments;