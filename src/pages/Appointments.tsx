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
import { PlusCircle, Search, CalendarCheck, CalendarX, CalendarClock, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, History } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AppointmentForm, { AppointmentFormValues } from "@/components/AppointmentForm"; // Importa AppointmentFormValues
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AppointmentDetailsDialog from "@/components/AppointmentDetailsDialog";
import AppointmentChronometer from "@/components/AppointmentChronometer"; // Importa o novo componente
import { format, parseISO } from "date-fns"; // Importar format e parseISO para a data

interface Appointment {
  id: string;
  date: string;
  time: string;
  client: string;
  pet: string;
  species: string;
  service: string;
  veterinarian: string;
  status: "Agendada" | "Realizada" | "Cancelada" | "Em Andamento"; // Adicionado 'Em Andamento'
  completionDate?: string; // NOVO: Data de finalização/cancelamento
  completionTime?: string; // NOVO: Hora de finalização/cancelamento
}

const mockAppointments: Appointment[] = [
  { id: "C001", date: "2024-10-26", time: "10:00", client: "João Silva", pet: "Rex", species: "Cachorro", service: "Consulta Geral", veterinarian: "Dr. Ana Paula", status: "Agendada" },
  { id: "C002", date: "2024-10-26", time: "14:30", client: "Maria Souza", pet: "Miau", species: "Gato", service: "Vacinação", veterinarian: "Dr. Carlos Eduardo", status: "Realizada", completionDate: "2024-10-26", completionTime: "15:00" },
  { id: "C003", date: "2024-10-27", time: "09:00", client: "Pedro Santos", pet: "Pingo", species: "Pássaro", service: "Exame de Rotina", veterinarian: "Dra. Beatriz Lima", status: "Cancelada", completionDate: "2024-10-27", completionTime: "08:30" },
  { id: "C004", date: "2024-10-28", time: "11:00", client: "Ana Costa", pet: "Bob", species: "Cachorro", service: "Banho e Tosa", veterinarian: "Dr. Ana Paula", status: "Agendada" },
  { id: "C005", date: "2024-10-29", time: "16:00", client: "Carlos Lima", pet: "Luna", species: "Gato", service: "Consulta de Retorno", veterinarian: "Dr. Carlos Eduardo", status: "Em Andamento" }, // Exemplo de 'Em Andamento'
  { id: "C006", date: "2024-10-25", time: "13:00", client: "Fernanda Reis", pet: "Thor", species: "Cachorro", service: "Cirurgia", veterinarian: "Dra. Beatriz Lima", status: "Realizada", completionDate: "2024-10-25", completionTime: "14:30" },
  { id: "C007", date: "2024-10-30", time: "10:00", client: "Lucas Mendes", pet: "Nemo", species: "Peixe", service: "Consulta Geral", veterinarian: "Dr. Ana Paula", status: "Agendada" },
  { id: "C008", date: "2024-10-31", time: "15:00", client: "Mariana Santos", pet: "Pipoca", species: "Roedor", service: "Exame de Rotina", veterinarian: "Dra. Beatriz Lima", status: "Agendada" },
];

// Mapeamento de espécies para ícones
const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
};

const Appointments = () => {
  const [activeTab, setActiveTab] = React.useState<string>("em-espera");
  const [appointments, setAppointments] = React.useState<Appointment[]>(mockAppointments);
  const [searchTerm, setSearchTerm] = React.useState<string>(""); // Para a busca nas abas filtradas
  const [historySearchTerm, setHistorySearchTerm] = React.useState<string>(""); // Para a busca no histórico

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = React.useState<boolean>(false);

  const getFilteredAppointments = (tab: string) => {
    let filtered = appointments;

    if (tab === "historico") {
      // No histórico, filtramos por termo de busca em todas as consultas
      if (historySearchTerm) {
        filtered = filtered.filter(app =>
          app.pet.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
          app.client.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
          app.service.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
          app.veterinarian.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
          app.status.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
          app.date.includes(historySearchTerm) ||
          app.time.includes(historySearchTerm) ||
          (app.completionDate && app.completionDate.includes(historySearchTerm)) ||
          (app.completionTime && app.completionTime.includes(historySearchTerm))
        );
      }
      return filtered; // Retorna todas as consultas (ou filtradas por termo) para o histórico
    }

    // Para as outras abas, filtramos por status e, opcionalmente, por termo de busca
    switch (tab) {
      case "em-espera":
        filtered = filtered.filter(app => app.status === "Agendada");
        break;
      case "em-andamento":
        filtered = filtered.filter(app => app.status === "Em Andamento");
        break;
      case "finalizadas":
        filtered = filtered.filter(app => app.status === "Realizada" || app.status === "Cancelada");
        break;
      default:
        filtered = []; // Caso padrão, não deve acontecer com as abas definidas
        break;
    }

    // Aplica o filtro de busca para as abas "Em Espera", "Em Andamento" e "Finalizadas"
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.pet.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.veterinarian.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  const handleAddAppointment = (data: AppointmentFormValues) => {
    const appointmentDate = data.dateOption === "today"
      ? format(new Date(), "yyyy-MM-dd")
      : data.date ? format(data.date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

    const newAppointment: Appointment = {
      id: `C${(appointments.length + 1).toString().padStart(3, '0')}`,
      date: appointmentDate,
      time: data.time,
      client: data.client,
      pet: data.pet,
      species: data.species,
      service: data.service,
      veterinarian: data.veterinarian,
      status: "Agendada",
    };
    setAppointments((prev) => [...prev, newAppointment]);
    setIsAddAppointmentDialogOpen(false);
  };

  const handleUpdateAppointment = (updatedAppointment: Appointment) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === updatedAppointment.id ? updatedAppointment : app))
    );
  };

  const handleCancelAppointment = (appointmentId: string) => {
    const now = new Date();
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === appointmentId
          ? {
              ...app,
              status: "Cancelada",
              completionDate: format(now, "yyyy-MM-dd"),
              completionTime: format(now, "HH:mm"),
            }
          : app
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
        return "bg-primary text-primary-foreground";
      case "Em Andamento":
        return "bg-orange-500 text-white";
      case "Realizada":
        return "bg-green-500 text-white";
      case "Cancelada":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const totalAgendadas = appointments.filter(a => a.status === "Agendada").length;
  const totalRealizadas = appointments.filter(a => a.status === "Realizada").length;
  const totalCanceladas = appointments.filter(a => a.status === "Cancelada").length;
  const totalEmAndamento = appointments.filter(a => a.status === "Em Andamento").length;

  const currentTabAppointments = getFilteredAppointments(activeTab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Consultas</h2>
        <Dialog open={isAddAppointmentDialogOpen} onOpenChange={setIsAddAppointmentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Incluir Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[60vh] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle>Incluir Nova Consulta</DialogTitle>
            </DialogHeader>
            <AppointmentForm onSubmit={handleAddAppointment} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gray-700 text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em espera</CardTitle>
            <CalendarClock className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgendadas}</div>
            <p className="text-gray-200 text-xs">Consultas aguardando</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500 text-white shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <CalendarClock className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmAndamento}</div>
            <p className="text-white/80 text-xs">Consultas em progresso</p>
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
        <Card className="bg-destructive text-destructive-foreground shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            <CalendarX className="h-4 w-4 text-destructive-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCanceladas}</div>
            <p className="text-destructive-foreground/80 text-xs">Consultas canceladas</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50"> {/* Ajustado para 4 colunas */}
            <TabsTrigger value="em-espera" className="data-[state=active]:bg-gray-500 data-[state=active]:text-white">Em Espera</TabsTrigger>
            <TabsTrigger value="em-andamento" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Em Andamento</TabsTrigger>
            <TabsTrigger value="finalizadas" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Finalizadas</TabsTrigger>
            <TabsTrigger value="historico" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <History className="h-4 w-4 mr-2" /> Histórico
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TabsContent value="em-espera" className="mt-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar consultas em espera..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Tempo de Espera</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTabAppointments.length > 0 ? (
                currentTabAppointments.map((appointment) => {
                  const IconComponent = speciesIconMap[appointment.species] || MoreHorizontal;
                  return (
                    <TableRow
                      key={appointment.id}
                      onClick={() => handleRowClick(appointment)}
                      className={cn("cursor-pointer hover:bg-muted/50")}
                    >
                      <TableCell className="font-medium flex items-center">
                        <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                        {appointment.pet}
                      </TableCell>
                      <TableCell>{appointment.client}</TableCell>
                      <TableCell>{appointment.service}</TableCell>
                      <TableCell>
                        <AppointmentChronometer date={appointment.date} time={appointment.time} />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhuma consulta em espera encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="em-andamento" className="mt-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar consultas em andamento..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Veterinário</TableHead>
                <TableHead>Tempo de Consulta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTabAppointments.length > 0 ? (
                currentTabAppointments.map((appointment) => {
                  const IconComponent = speciesIconMap[appointment.species] || MoreHorizontal;
                  return (
                    <TableRow
                      key={appointment.id}
                      onClick={() => handleRowClick(appointment)}
                      className={cn("cursor-pointer hover:bg-muted/50")}
                    >
                      <TableCell className="font-medium flex items-center">
                        <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                        {appointment.pet}
                      </TableCell>
                      <TableCell>{appointment.client}</TableCell>
                      <TableCell>{appointment.service}</TableCell>
                      <TableCell className="flex items-center">
                        {appointment.veterinarian}
                        <Badge className={cn("ml-2", getStatusBadgeVariant("Em Andamento"))}>
                          Iniciada
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <AppointmentChronometer date={appointment.date} time={appointment.time} />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhuma consulta em andamento encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="finalizadas" className="mt-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar consultas finalizadas..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Veterinário</TableHead>
                <TableHead>Data Finalização</TableHead>
                <TableHead>Hora Finalização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTabAppointments.length > 0 ? (
                currentTabAppointments.map((appointment) => {
                  const IconComponent = speciesIconMap[appointment.species] || MoreHorizontal;
                  const isCancelled = appointment.status === "Cancelada";
                  const isRealizada = appointment.status === "Realizada";
                  return (
                    <TableRow
                      key={appointment.id}
                      onClick={() => handleRowClick(appointment)}
                      className={cn("cursor-pointer hover:bg-muted/50")}
                    >
                      <TableCell className="font-medium flex items-center">
                        <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                        {appointment.pet}
                      </TableCell>
                      <TableCell>{appointment.client}</TableCell>
                      <TableCell>{appointment.service}</TableCell>
                      <TableCell className="flex items-center">
                        {appointment.veterinarian}
                        {isCancelled && (
                          <Badge className={cn("ml-2", getStatusBadgeVariant("Cancelada"))}>
                            Cancelada
                          </Badge>
                        )}
                        {isRealizada && (
                          <Badge className={cn("ml-2", getStatusBadgeVariant("Realizada"))}>
                            Concluída
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{appointment.completionDate || "N/A"}</TableCell>
                      <TableCell>{appointment.completionTime || "N/A"}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma consulta finalizada encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="historico" className="mt-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar em todas as consultas..."
            className="pl-9"
            value={historySearchTerm}
            onChange={(e) => setHistorySearchTerm(e.target.value)}
          />
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
                <TableHead>Data Agendada</TableHead>
                <TableHead>Hora Agendada</TableHead>
                <TableHead>Data Finalização</TableHead>
                <TableHead>Hora Finalização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTabAppointments.length > 0 ? (
                currentTabAppointments.map((appointment) => {
                  const IconComponent = speciesIconMap[appointment.species] || MoreHorizontal;
                  return (
                    <TableRow
                      key={appointment.id}
                      onClick={() => handleRowClick(appointment)}
                      className={cn("cursor-pointer hover:bg-muted/50")}
                    >
                      <TableCell className="font-medium flex items-center">
                        <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                        {appointment.pet}
                      </TableCell>
                      <TableCell>{appointment.client}</TableCell>
                      <TableCell>{appointment.service}</TableCell>
                      <TableCell>{appointment.veterinarian}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeVariant(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{appointment.date}</TableCell>
                      <TableCell>{appointment.time}</TableCell>
                      <TableCell>{appointment.completionDate || "N/A"}</TableCell>
                      <TableCell>{appointment.completionTime || "N/A"}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    Nenhuma consulta encontrada no histórico.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

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