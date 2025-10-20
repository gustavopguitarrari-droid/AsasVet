import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal } from "lucide-react"; // Importar ícones
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import InternmentForm, { InternmentFormValues } from "@/components/InternmentForm";
import { format } from "date-fns";
import { cn } from "@/lib/utils"; // Importar cn para classes condicionais

interface InternedPatient {
  id: string;
  petName: string;
  ownerName: string;
  reason: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  veterinarian: string;
  status: "Em Observação" | "Estável" | "Crítico" | "Alta";
  species: string; // Adicionado campo de espécie
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

const Internacao = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
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
        species: "Cachorro", // Adicionado espécie
      },
      {
        id: "INT002",
        petName: "Mittens",
        ownerName: "Bob Johnson",
        reason: "Infecção respiratória",
        admissionDate: "2024-10-25",
        veterinarian: "Dr. Carlos Eduardo",
        status: "Em Observação",
        species: "Gato", // Adicionado espécie
      },
      {
        id: "INT003",
        petName: "Chico",
        ownerName: "Carlos Pereira",
        reason: "Check-up de rotina",
        admissionDate: "2024-10-26",
        veterinarian: "Dra. Beatriz Lima",
        status: "Em Observação",
        species: "Pássaro", // Adicionado espécie
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
      status: data.status,
      species: data.species, // Capturar a espécie do formulário
    };
    setInternedPatients((prev) => [...prev, newPatient]);
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Internação</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold">
              <PlusCircle className="mr-2 h-4 w-4" /> Internar Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-4"> {/* Ajustado aqui */}
            <DialogHeader>
              <DialogTitle>Internar Novo Paciente</DialogTitle>
            </DialogHeader>
            <InternmentForm onSubmit={handleAddInternment} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-muted-foreground">Esta página está pronta para ser refeita.</p>
      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-4">Pacientes Internados</h3>
        {internedPatients.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {internedPatients.map((patient) => {
              const IconComponent = speciesIconMap[patient.species] || MoreHorizontal;
              const colorClass = speciesColorMap[patient.species] || "text-muted-foreground"; // Obter a classe de cor dinâmica
              return (
                <li key={patient.id} className="p-3 border rounded-md bg-card shadow-sm">
                  <p className="font-bold text-lg flex items-center">
                    <IconComponent className={cn("h-6 w-6 mr-2", colorClass)} /> {/* Aplicar a classe de cor */}
                    {patient.petName}
                  </p>
                  <p className="text-base text-muted-foreground"><span className="font-bold">Tutor:</span> {patient.ownerName}</p>
                  <p className="text-base text-muted-foreground"><span className="font-bold">Motivo:</span> {patient.reason}</p>
                  <p className="text-base text-muted-foreground"><span className="font-bold">Status:</span> {patient.status}</p>
                  <p className="text-base text-muted-foreground"><span className="font-bold">Admissão:</span> {patient.admissionDate}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground">Nenhum paciente internado no momento.</p>
        )}
      </div>
    </div>
  );
};

export default Internacao;