import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import InternmentForm, { InternmentFormValues } from "@/components/InternmentForm";
import InternmentDetailsDialog from "@/components/InternmentDetailsDialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Importar componentes de Tabs

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

const Internacao = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState<InternedPatient | null>(null);
  const [internedPatients, setInternedPatients] = React.useState<InternedPatient[]>([]);
  const [activeTab, setActiveTab] = React.useState<string>("pacientes-internados"); // Estado para a aba ativa

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
    ];
    setInternedPatients(mockPatients);
  }, []);

  const handleAddInternment = (data: InternmentFormValues) => {
    const newPatient: InternedPatient = {
      id: `INT${(internedPatients.length + 1).toString().padStart(3, '0')}`,
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
    setInternedPatients((prev) =>
      prev.map((patient) => (patient.id === updatedPatient.id ? updatedPatient : patient))
    );
  };

  const handleCardClick = (patient: InternedPatient) => {
    setSelectedPatient(patient);
    setIsDetailsDialogOpen(true);
  };

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
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="pacientes-internados" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Pacientes Internados</TabsTrigger>
          <TabsTrigger value="mapa-execucao" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Mapa de Execução</TabsTrigger>
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
                      <p className="text-base text-muted-foreground"><span className="font-bold">Admissão:</span> {patient.admissionDate}</p>
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