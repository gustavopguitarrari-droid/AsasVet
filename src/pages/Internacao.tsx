"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, CalendarDays, User, Stethoscope, Search, History, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import InternmentForm, { InternmentFormValues } from "@/components/InternmentForm";
import InternmentDetailsDialog from "@/components/InternmentDetailsDialog";
import InternmentHistoryDialog from "@/components/InternmentHistoryDialog";
import ExecutionMapTable from "@/components/ExecutionMapTable";
import { format, isSameDay, parseISO, isBefore, isAfter, isEqual, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AddPatientActionDialog, { PatientActionFormValues } from "@/components/AddPatientActionDialog"; // Importar o novo diálogo

type RiskLevel = "Sem risco" | "Baixo" | "Médio" | "Alto" | "Emergência";

interface InternedPatient {
  id: string;
  bayName: string;
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

// Novo tipo para as ações dos pacientes
export interface PatientAction {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  hour: string; // HH
  description: string;
  type: "Medicação" | "Alimentação" | "Observação" | "Outro";
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
  "Alta": "bg-green-500",
  "Óbito": "bg-red-500",
};

const Internacao = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<InternedPatient | null>(null);
  const [internedPatients, setInternedPatients] = React.useState<InternedPatient[]>([]);
  const [historyPatients, setHistoryPatients] = React.useState<InternedPatient[]>([]);
  const [activeTab, setActiveTab] = React.useState<string>("pacientes-internados");
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date()); // Alterado para sempre ser Date
  const [patientSearchTerm, setPatientSearchTerm] = React.useState<string>("");

  // Estados para o diálogo de adicionar ação
  const [isAddActionDialogOpen, setIsAddActionDialogOpen] = React.useState(false);
  const [actionPatientId, setActionPatientId] = React.useState<string | null>(null);
  const [actionPatientName, setActionPatientName] = React.useState<string | null>(null);
  const [actionDate, setActionDate] = React.useState<Date | null>(null);
  const [actionHour, setActionHour] = React.useState<string | null>(null);
  const [patientActions, setPatientActions] = React.useState<PatientAction[]>([]); // Novo estado para as ações

  React.useEffect(() => {
    const mockPatients: InternedPatient[] = [
      {
        id: "INT001",
        bayName: "Baia 1",
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
        bayName: "UTI 2",
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
        bayName: "Baia 3",
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
        bayName: "Emergência",
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
        bayName: "Baia 4",
        petName: "Dory",
        ownerName: "Lucas Mendes",
        reason: "Observação pós-cirúrgica",
        admissionDate: "2024-10-28",
        veterinarian: "Dr. Carlos Eduardo",
        status: "Estável",
        species: "Peixe",
        risk: "Sem risco",
      },
      {
        id: "INT006",
        bayName: "Baia 5",
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
        bayName: "UTI 1",
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

    // Mock de ações iniciais
    const mockActions: PatientAction[] = [
      { id: "ACT001", patientId: "INT001", date: "2024-10-27", hour: "10", description: "Administrar antibiótico", type: "Medicação" },
      { id: "ACT001", patientId: "INT001", date: "2024-10-27", hour: "14", description: "Alimentação", type: "Alimentação" },
      { id: "ACT002", patientId: "INT002", date: "2024-10-27", hour: "11", description: "Verificar temperatura", type: "Observação" },
    ];
    setPatientActions(mockActions);

  }, []);

  const handleAddInternment = (data: InternmentFormValues) => {
    const newPatient: InternedPatient = {
      id: `INT${(internedPatients.length + historyPatients.length + 1).toString().padStart(3, '0')}`,
      bayName: data.bayName,
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

  const patientsForExecutionMap = React.useMemo(() => {
    return internedPatients;
  }, [internedPatients]);

  const handlePreviousDay = () => {
    setSelectedDate((prevDate) => subDays(prevDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate((prevDate) => addDays(prevDate, 1));
  };

  const filteredInternedPatients = internedPatients.filter(patient =>
    patient.petName.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.ownerName.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.bayName.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.veterinarian.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.species.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.status.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.risk.toLowerCase().includes(patientSearchTerm.toLowerCase())
  );

  // Funções para o diálogo de adicionar ação
  const handleOpenAddActionDialog = (patientId: string, patientName: string, date: Date, hour: string) => {
    setActionPatientId(patientId);
    setActionPatientName(patientName);
    setActionDate(date);
    setActionHour(hour);
    setIsAddActionDialogOpen(true);
  };

  // Modificado para aceitar um array de ações
  const handleSaveAllPatientActions = (actionsToSave: PatientActionFormValues[]) => {
    if (actionPatientId && actionDate && actionHour) {
      const newActions: PatientAction[] = actionsToSave.map((data, index) => ({
        id: `ACT${(patientActions.length + index + 1).toString().padStart(3, '0')}`, // Gerar ID único para cada ação
        patientId: actionPatientId,
        date: format(actionDate, "yyyy-MM-dd"),
        hour: actionHour,
        description: data.description,
        type: data.type,
      }));
      setPatientActions((prev) => [...prev, ...newActions]); // Adicionar todas as novas ações
      setIsAddActionDialogOpen(false);
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "pacientes-internados":
        return "Pacientes Internados";
      case "mapa-execucao":
        return "Mapa de Execução";
      default:
        return "Internação";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">{getPageTitle()}</h2>
        <div className="flex space-x-2">
          {activeTab === "pacientes-internados" && (
            <>
              <Button className="font-bold" onClick={() => setIsHistoryDialogOpen(true)}>
                <History className="mr-2 h-4 w-4" /> Ver Histórico
              </Button>
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
            </>
          )}
          {activeTab === "mapa-execucao" && (
            <div className="flex items-center space-x-2">
              <Button variant="default" size="icon" onClick={handlePreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(day) => setSelectedDate(day || new Date())}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <Button variant="default" size="icon" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="pacientes-internados" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Pacientes Internados</TabsTrigger>
          <TabsTrigger value="mapa-execucao" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Mapa de Execução</TabsTrigger>
        </TabsList>

        <TabsContent value="pacientes-internados" className="mt-4">
          <div className="mt-8">
            <div className="flex flex-wrap gap-4 mb-6">
              {Object.entries(riskColorMap).map(([risk, colorClass]) => (
                <div key={risk} className="flex items-center space-x-2">
                  <span className={cn("h-4 w-4 rounded-full", colorClass)}></span>
                  <span className="text-sm text-muted-foreground">{risk}</span>
                </div>
              ))}
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar pacientes internados..."
                className="pl-9"
                value={patientSearchTerm}
                onChange={(e) => setPatientSearchTerm(e.target.value)}
              />
            </div>
            {filteredInternedPatients.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredInternedPatients.map((patient) => {
                  const IconComponent = speciesIconMap[patient.species] || MoreHorizontal;
                  const speciesTextColorClass = speciesColorMap[patient.species] || "text-muted-foreground";
                  const riskStripeColorClass = riskColorMap[patient.risk];

                  return (
                    <li
                      key={patient.id}
                      className="relative p-3 border rounded-md bg-white dark:bg-gray-800 shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleCardClick(patient)}
                    >
                      <div className={cn("absolute top-0 right-0 h-full w-4 rounded-r-md", riskStripeColorClass)}></div>
                      
                      <div className="absolute top-2 right-6 text-base font-bold text-muted-foreground">
                        {patient.bayName}
                      </div>

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
          <div className="p-4 border rounded-md bg-background space-y-4">
            <ExecutionMapTable
              patients={patientsForExecutionMap}
              selectedDate={selectedDate}
              patientActions={patientActions}
              onAddActionClick={handleOpenAddActionDialog}
            />
          </div>
        </TabsContent>
      </Tabs>

      <InternmentDetailsDialog
        patient={selectedPatient}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        onUpdate={handleUpdateInternment}
      />

      <InternmentHistoryDialog
        isOpen={isHistoryDialogOpen}
        onClose={() => setIsHistoryDialogOpen(false)}
        historyPatients={historyPatients}
      />

      {isAddActionDialogOpen && actionPatientId && actionPatientName && actionDate && actionHour && (
        <AddPatientActionDialog
          isOpen={isAddActionDialogOpen}
          onClose={() => setIsAddActionDialogOpen(false)}
          onSaveAllActions={handleSaveAllPatientActions}
          patientName={actionPatientName}
          date={actionDate}
          hour={actionHour}
        />
      )}
    </div>
  );
};

export default Internacao;