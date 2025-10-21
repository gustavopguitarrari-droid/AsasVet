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
import { PlusCircle, Search, HeartPulse, User, IdCard } from "lucide-react";
import RoleFilter from "@/components/RoleFilter"; // Reutilizando o filtro de cargos, se aplicável

interface Enfermeiro {
  id: string;
  name: string;
  coren: string;
  email: string;
  phone: string;
  specialty: string; // Especialidade do enfermeiro
}

const mockEnfermeiros: Enfermeiro[] = [
  { id: "E001", name: "Enf. Juliana Silva", coren: "COREN-SP 123456", email: "juliana.s@example.com", phone: "(11) 99999-1111", specialty: "Clínica Geral" },
  { id: "E002", name: "Enf. Rafael Mendes", coren: "COREN-RJ 789012", email: "rafael.m@example.com", phone: "(21) 98888-2222", specialty: "Emergência" },
  { id: "E003", name: "Enf. Carla Oliveira", coren: "COREN-MG 345678", email: "carla.o@example.com", phone: "(31) 97777-3333", specialty: "UTI Veterinária" },
];

const specialtyIconMap: { [key: string]: React.ElementType } = {
  "Clínica Geral": HeartPulse,
  "Emergência": HeartPulse,
  "UTI Veterinária": HeartPulse,
  "Outros": IdCard,
};

const Enfermeiros = () => {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  // Poderíamos ter um filtro por especialidade aqui, similar ao RoleFilter

  const filteredEnfermeiros = mockEnfermeiros.filter((enf) =>
    enf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enf.coren.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enf.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enf.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enf.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Enfermeiros</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Enfermeiro
        </Button>
      </div>

      {/* Se um filtro de especialidade for necessário, ele pode ser adicionado aqui */}
      {/* <RoleFilter selectedRole={selectedSpecialty} onSelectRole={handleSelectSpecialty} /> */}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar enfermeiros..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">Filtrar</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>COREN</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEnfermeiros.length > 0 ? (
              filteredEnfermeiros.map((enf) => {
                const IconComponent = specialtyIconMap[enf.specialty] || IdCard;
                return (
                  <TableRow key={enf.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-bold">{enf.name}</TableCell>
                    <TableCell>{enf.coren}</TableCell>
                    <TableCell className="flex items-center">
                      <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                      {enf.specialty}
                    </TableCell>
                    <TableCell>{enf.email}</TableCell>
                    <TableCell>{enf.phone}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum enfermeiro encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Enfermeiros;