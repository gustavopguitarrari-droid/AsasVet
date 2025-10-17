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
import { PlusCircle, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AppointmentForm from "@/components/AppointmentForm"; // Importa o novo componente de formulário

interface Appointment {
  id: string;
  date: string;
  time: string;
  client: string;
  pet: string;
  service: string;
  status: "Agendada" | "Realizada" | "Cancelada";
}

const mockAppointments: Appointment[] = [
  { id: "C001", date: "2024-10-26", time: "10:00", client: "João Silva", pet: "Rex", service: "Consulta Geral", status: "Agendada" },
  { id: "C002", date: "2024-10-26", time: "14:30", client: "Maria Souza", pet: "Miau", service: "Vacinação", status: "Realizada" },
  { id: "C003", date: "2024-10-27", time: "09:00", client: "Pedro Santos", pet: "Pingo", service: "Exame de Rotina", status: "Cancelada" },
  { id: "C004", date: "2024-10-28", time: "11:00", client: "Ana Costa", pet: "Bob", service: "Banho e Tosa", status: "Agendada" },
  { id: "C005", date: "2024-10-29", time: "16:00", client: "Carlos Lima", pet: "Luna", service: "Consulta de Retorno", status: "Agendada" },
  { id: "C006", date: "2024-10-25", time: "13:00", client: "Fernanda Reis", pet: "Thor", service: "Cirurgia", status: "Realizada" },
];

const Appointments = () => {
  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [appointments, setAppointments] = React.useState<Appointment[]>(mockAppointments);
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesTab = activeTab === "all" || appointment.status === activeTab;
    const matchesSearch =
      appointment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.pet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleAddAppointment = (newAppointment: Omit<Appointment, "id">) => {
    const newId = `C${(appointments.length + 1).toString().padStart(3, '0')}`;
    setAppointments((prev) => [...prev, { id: newId, ...newAppointment }]);
    setIsDialogOpen(false);
  };

  const getStatusVariant = (status: Appointment["status"]) => {
    switch (status) {
      case "Agendada":
        return "default"; // Azul padrão
      case "Realizada":
        return "success"; // Verde
      case "Cancelada":
        return "destructive"; // Vermelho
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Consultas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="Agendada">Agendadas</TabsTrigger>
            <TabsTrigger value="Realizada">Realizadas</TabsTrigger>
            <TabsTrigger value="Cancelada">Canceladas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Animal</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.id}</TableCell>
                  <TableCell>{appointment.date}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>{appointment.client}</TableCell>
                  <TableCell>{appointment.pet}</TableCell>
                  <TableCell>{appointment.service}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(appointment.status)}>
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
                <TableCell colSpan={8} className="h-24 text-center">
                  Nenhuma consulta encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Appointments;