import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import InternmentForm, { InternmentFormValues } from "@/components/InternmentForm";
import InternmentDetailsDialog from "@/components/InternmentDetailsDialog"; // Importar o novo diálogo
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type RiskLevel = "Sem risco" | "Baixo" | "Médio" | "Alto" | "Emergência";

interface InternedPatient {
  id: string;
  petName: string;
  ownerName: string;
  reason: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  veterinarian: string;
  status: "Em Observação" | "Estável" | "Crítico" | "Alta";
  species: string;
  risk: RiskLevel;
}

// Mapeamento de espécies para ícones (reutilizado de Pets.tsx)
const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
};

// Mapeamento de espécies para classes de cor dinâmicas (usando as cores do sidebar-item-bg)
const speciesColorMap: { [key: string]: string } = {
  Cachorro: "text-sidebar-item-bg-1",
  Gato: "text-sidebar-item-bg-4",
  Pássaro: "text-sidebar-item-bg-3",
  Roedor: "text-sidebar-item-bg-7",
  Peixe: "text-sidebar-item-bg-5",
  Outros: "text-sidebar-item-bg-9",
};

// Mapeamento de risco para classes de cor (as mesmas do RiskSelector)
const riskColorMap: Record<RiskLevel, string> = {
  "Sem risco": "bg-blue-500",
  "Baixo": "bg-green-500",
  "Médio": "bg-yellow-500",
  "Alto": "bg-orange-500",
  "Emergência": "bg-red-500",
};

const Internacao = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false); // Renomeado para clareza
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false); // Novo estado para o diálogo de detalhes
  const [selectedPatient, setSelectedPatient] = React.useState<InternedPatient | null>(null); // Novo estado para o paciente selecionado
  const [internedPatients, setInternedPatients] = React.useState<InternedPatient[]>([]);

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
      status: "Em Observação", // Status inicial padrão ao adicionar
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
      <p className="text-muted-foreground">Esta página está pronta para ser refeita.</p>
      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-4">Pacientes Internados</h3>
        {internedPatients.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {internedPatients.map((patient) => {
              const IconComponent = speciesIconMap[patient.species] || MoreHorizontal;
              const speciesTextColorClass = speciesColorMap[patient.species] || "text-muted-foreground";
              const riskStripeColorClass = riskColorMap[patient.risk];

              return (
                <li
                  key={patient.id}
                  className="relative p-3 border rounded-md bg-gray-100 dark:bg-gray-800 shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleCardClick(patient)}
                >
                  {/* Faixa lateral de risco */}
                  <div className={cn("absolute top-0 right-0 h-full w-2 rounded-r-md", riskStripeColorClass)}></div>
                  
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