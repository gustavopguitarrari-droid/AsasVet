import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, CalendarDays, User, Stethoscope, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import InternmentForm, { InternmentFormValues } from "@/components/InternmentForm";
import InternmentDetailsDialog from "@/components/InternmentDetailsDialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type RiskLevel = "Sem risco" | "Baixo" | "Médio" | "Alto" | "Emergência";

interface InternedPatient {
  id: string;
  petName: string;
  ownerName: string;
  reason: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  veterinarian: string;
  status: "Em Observação" | "Estável" | "Crítico" | "Alta" | "Óbito";
  species: string;
  risk: RiskLevel;
}

const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
};

const speciesColorMap: { [key: string]: string } = {
  Cachorro: "text-sidebar-item-bg-1",
  Gato: "text-sidebar-item-bg-4",
  Pássaro: "text-sidebar-item-bg-3",
  Roedor: "text-sidebar-item-bg-7",
  Peixe: "text-sidebar-item-bg-5",
  Outros: "text-sidebar-item-bg-9",
};

const riskColorMap: Record<RiskLevel, string> = {
  "Sem risco": "bg-blue-500",
  "Baixo": "bg-green-500",
  "Médio": "bg-yellow-500",
  "Alto": "bg-orange-500",
  "Emergência": "bg-red-500",
};

const statusBadgeColorMap: Record<InternedPatient["status"], string> = {
  "Em Observação": "bg-blue-500",
  "Estável": "bg-green-500",
  "Crítico": "bg-red-500",
  "Alta": "bg-green-500", // Alterado para verde
  "Óbito": "bg-red-500",   // Alterado para vermelho
};

const Internacao = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<InternedPatient | null>(null);
  const [internedPatients, setInternedPatients] = React.useState<InternedPatient[]>([]);
  const [historyPatients, setHistoryPatients] = React.useState<InternedPatient[]>([]);
  const [activeTab, setActiveTab] = React.useState<string>("pacientes-internados");
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  React.useEffect(() => {
    const mockPatients: InternedPatient[] = [
      {
        id: "INT001",
        petName: "Buddy",
        ownerName: "Alice Smith",
        reason: "Fratura na pata",
        admissionDate: "2024-10-20",
        expectedDischargeDate: "2024-10-28",
        veterinarian: "Dr. Ana Paula",
        status: "Estável",
        species: "Cachorro",
        risk: "Médio",
      },
      {
        id: "INT002",
        petName: "Mittens",
        ownerName: "Bob Johnson",
        reason: "Infecção respiratória",
        admissionDate: "2024-10-25",
        veterinarian: "Dr. Carlos Eduardo",
        status: "Em Observação",
        species: "Gato",
        risk: "Alto",
      },
      {
        id: "INT003",
        petName: "Chico",
        ownerName: "Carlos Pereira",
        reason: "Check-up de rotina",
        admissionDate: "2024-10-26",
        veterinarian: "Dra. Beatriz Lima",
        status: "Em Observação",
        species: "Pássaro",
        risk: "Baixo",
      },
      {
        id: "INT004",
        petName: "Max",
        ownerName: "Fernanda Reis",
        reason: "Emergência - atropelamento",
        admissionDate: "2024-10-27",
        veterinarian: "Dr. Ana Paula",
        status: "Crítico",
        species: "Cachorro",
        risk: "Emergência",
      },
      {
        id: "INT005",
        petName: "Dory",
        ownerName: "Lucas Mendes",
        reason: "Observação pós-cirúrgica",
        admissionDate: "2024-10-28",
        veterinarian: "Dr. Carlos Eduardo",
        status: "Estável",
        species: "Peixe",
        risk: "Sem risco",
      },
      // Adicionando alguns pacientes de histórico para demonstração
      {
        id: "INT006",
        petName: "Rocky",
        ownerName: "Gabriel Santos",
        reason: "Recuperação de cirurgia",
        admissionDate: "2024-09-10",
        expectedDischargeDate: "2024-09-15",
        veterinarian: "Dr. Ana Paula",
        status: "Alta",
        species: "Cachorro",
        risk: "Baixo",
      },
      {
        id: "INT007",
        petName: "Shadow",
        ownerName: "Isabela Oliveira",
        reason: "Doença crônica",
        admissionDate: "2024-08-01",
        expectedDischargeDate: "2024-08-05",
        veterinarian: "Dr. Carlos Eduardo",
        status: "Óbito",
        species: "Gato",
        risk: "Emergência",
      },
    ];

    const active = mockPatients.filter(p => p.status !== "Alta" && p.status !== "Óbito");
    const history = mockPatients.filter(p => p.status === "Alta" || p.status === "Óbito");
    setInternedPatients(active);
    setHistoryPatients(history);
  }, []);

  const handleAddInternment = (data: InternmentFormValues) => {
    const newPatient: InternedPatient = {
      id: `INT${(internedPatients.length + historyPatients.length + 1).toString().padStart(3, '0')}`,
      petName: data.petName,
      ownerName: data.ownerName,
      reason: data.reason,
      admissionDate: format(data.admissionDate, "yyyy-MM-dd"),
      expectedDischargeDate: data.expectedDischargeDate ? format(data.expectedDischargeDate, "yyyy-MM-dd") : undefined,
      veterinarian: data.veterinarian,
      status: "Em Observação",
      species: data.species,
      risk: data.risk,
    };
    setInternedPatients((prev) => [...prev, newPatient]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateInternment = (updatedPatient: InternedPatient) => {
    if (updatedPatient.status === "Alta" || updatedPatient.status === "Óbito") {
      setInternedPatients((prev) => prev.filter((p) => p.id !== updatedPatient.id));
      setHistoryPatients((prev) => [...prev, updatedPatient]);
    } else {
      setInternedPatients((prev) =>
        prev.map((patient) => (patient.id === updatedPatient.id ? updatedPatient : patient))
      );
    }
  };

  const handleCardClick = (patient: InternedPatient) => {
    setSelectedPatient(patient);
    setIsDetailsDialogOpen(true);
  };

  const filteredHistoryPatients = historyPatients.filter(patient =>
    patient.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.veterinarian.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Internação</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold">
              <PlusCircle className="mr-2 h-4 w-4" /> Internar Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4">
            <DialogHeader>
              <DialogTitle>Internar Novo Paciente</DialogTitle>
            </DialogHeader>
            <InternmentForm onSubmit={handleAddInternment} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="pacientes-internados" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Pacientes Internados</TabsTrigger>
          <TabsTrigger value="mapa-execucao" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Mapa de Execução</TabsTrigger>
          <TabsTrigger value="historico-internados" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Histórico de Internados</TabsTrigger>
        </TabsList>

        <TabsContent value="pacientes-internados" className="mt-4">
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4">Pacientes Atualmente Internados</h3>
            {internedPatients.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {internedPatients.map((patient) => {
                  const IconComponent = speciesIconMap[patient.species] || MoreHorizontal;
                  const speciesTextColorClass = speciesColorMap[patient.species] || "text-muted-foreground";
                  const riskStripeColorClass = riskColorMap[patient.risk];

                  return (
                    <li
                      key={patient.id}
                      className="relative p-3 border rounded-md bg-white dark:bg-gray-800 shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleCardClick(patient)}
                    >
                      {/* Faixa lateral de risco */}
                      <div className={cn("absolute top-0 right-0 h-full w-4 rounded-r-md", riskStripeColorClass)}></div>
                      
                      <p className="font-bold text-lg flex items-center">
                        <IconComponent className={cn("h-6 w-6 mr-2", speciesTextColorClass)} />
                        {patient.petName}
                      </p>
                      <p className="text-base text-muted-foreground"><span className="font-bold">Tutor:</span> {patient.ownerName}</p>
                      <p className="text-base text-muted-foreground"><span className="font-bold">Motivo:</span> {patient.reason}</p>
                      <p className="text-base text-muted-foreground"><span className="font-bold">Status:</span> {patient.status}</p>
                      <p className="text-base text-muted-foreground"><span className="font-bold">Risco:</span> {patient.risk}</p>
                      <p className="text-base text-muted-foreground"><span className="font-bold">Entrada:</span> {patient.admissionDate}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nenhum paciente internado no momento.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="mapa-execucao" className="mt-4">
          <div className="p-4 border rounded-md bg-background">
            <h3 className="text-2xl font-semibold mb-4">Mapa de Execução</h3>
            <p className="text-muted-foreground">Conteúdo para o mapa de execução será adicionado aqui.</p>
          </div>
        </TabsContent>

        <TabsContent value="historico-internados" className="mt-4">
          <div className="p-4 border rounded-md bg-background">
            <h3 className="text-2xl font-semibold mb-4">Histórico de Pacientes Internados</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar no histórico..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {filteredHistoryPatients.length > 0 ? (
              <ul className="space-y-4">
                {filteredHistoryPatients.map((patient) => {
                  const IconComponent = speciesIconMap[patient.species] || MoreHorizontal;
                  const statusColorClass = statusBadgeColorMap[patient.status] || "bg-gray-500";
                  const finalDate = patient.expectedDischargeDate || patient.admissionDate;

                  return (
                    <li key={patient.id} className="flex items-center p-4 border rounded-md shadow-sm bg-card text-card-foreground">
                      <IconComponent className={cn("h-6 w-6 mr-4", speciesColorMap[patient.species])} />
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                        <p className="font-bold text-lg">{patient.petName}</p>
                        <p className="text-muted-foreground flex items-center">
                          <User className="h-4 w-4 mr-2" /> {patient.ownerName}
                        </p>
                        <p className="text-muted-foreground flex items-center">
                          <Stethoscope className="h-4 w-4 mr-2" /> {patient.veterinarian}
                        </p>
                      </div>
                      <div className="flex flex-col items-end ml-4">
                        <Badge className={cn("text-white mb-1", statusColorClass)}>
                          {patient.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center">
                          <CalendarDays className="h-4 w-4 mr-1" /> {finalDate}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nenhum paciente no histórico de internações que corresponda à sua busca.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <InternmentDetailsDialog
        patient={selectedPatient}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        onUpdate={handleUpdateInternment}
      />
    </div>
  );
};

export default Internacao;