import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, CalendarDays, User, Stethoscope, Search, History, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"; // Importar CalendarIcon, ChevronLeft, ChevronRight
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import InternmentForm, { InternmentFormValues } from "@/components/InternmentForm";
import InternmentDetailsDialog from "@/components/InternmentDetailsDialog";
import InternmentHistoryDialog from "@/components/InternmentHistoryDialog";
import ExecutionMapTable from "@/components/ExecutionMapTable";
import { format, isSameDay, parseISO, isBefore, isAfter, isEqual, addDays, subDays } from "date-fns"; // Importar addDays e subDays
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type RiskLevel = "Sem risco" | "Baixo" | "Médio" | "Alto" | "Emergência";

interface InternedPatient {
  id: string;
  bayName: string; // Novo campo
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
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [patientSearchTerm, setPatientSearchTerm] = React.useState<string>(""); // Novo estado para a pesquisa

  React.useEffect(() => {
    const mockPatients: InternedPatient[] = [
      {
        id: "INT001",
        bayName: "Baia 1", // Adicionado
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
        bayName: "UTI 2", // Adicionado
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
        bayName: "Baia 3", // Adicionado
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
        bayName: "Emergência", // Adicionado
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
        bayName: "Baia 4", // Adicionado
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
        bayName: "Baia 5", // Adicionado
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
        bayName: "UTI 1", // Adicionado
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
      bayName: data.bayName, // Incluindo o nome da baia
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

  // Filtra os pacientes para o mapa de execução com base na data selecionada
  const patientsForExecutionMap = React.useMemo(() => {
    if (!selectedDate) return [];

    return internedPatients.filter(patient => {
      const admission = parseISO(patient.admissionDate);
      const discharge = patient.expectedDischargeDate ? parseISO(patient.expectedDischargeDate) : null;

      // Paciente está internado se:
      // 1. A data de admissão é anterior ou igual à data selecionada
      // 2. E (a data de alta esperada é posterior ou igual à data selecionada OU não há data de alta esperada)
      // 3. E o status não é "Alta" nem "Óbito" (já filtrado em internedPatients, mas bom reforçar)
      const isAdmittedOnOrBeforeSelectedDate = isBefore(admission, selectedDate) || isEqual(admission, selectedDate);
      const isNotDischargedOnOrBeforeSelectedDate = !discharge || isAfter(discharge, selectedDate) || isEqual(discharge, selectedDate);

      return isAdmittedOnOrBeforeSelectedDate && isNotDischargedOnOrBeforeSelectedDate;
    });
  }, [internedPatients, selectedDate]);

  const handlePreviousDay = () => {
    setSelectedDate((prevDate) => (prevDate ? subDays(prevDate, 1) : undefined));
  };

  const handleNextDay = () => {
    setSelectedDate((prevDate) => (prevDate ? addDays(prevDate, 1) : undefined));
  };

  // Filtra os pacientes internados com base no termo de pesquisa
  const filteredInternedPatients = internedPatients.filter(patient =>
    patient.petName.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.ownerName.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.bayName.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.veterinarian.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.species.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.status.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.risk.toLowerCase().includes(patientSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Internação</h2>
        <div className="flex space-x-2">
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
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="pacientes-internados" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Pacientes Internados</TabsTrigger>
          <TabsTrigger value="mapa-execucao" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Mapa de Execução</TabsTrigger>
        </TabsList>

        <TabsContent value="pacientes-internados" className="mt-4">
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4">Pacientes Atualmente Internados</h3>
            {/* Barra de pesquisa adicionada aqui */}
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
                      
                      {/* Nome da Baia no canto superior direito */}
                      <div className="absolute top-2 right-6 text-base font-bold text-muted-foreground"> {/* Alterado para text-base e font-bold */}
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
            {/* <h3 className="text-2xl font-semibold mb-4">Mapa de Execução Diário</h3> */} {/* Linha removida */}
            <div className="flex justify-center items-center space-x-2"> {/* Adicionado flexbox para alinhar */}
              <Button variant="outline" size="icon" onClick={handlePreviousDay}>
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
                    onSelect={setSelectedDate}
                    initialFocus
                    locale={ptBR}
                  />
                  </PopoverContent>
                </Popover>
              <Button variant="outline" size="icon" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <ExecutionMapTable patients={patientsForExecutionMap} />
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
    </div>
  );
};

export default Internacao;