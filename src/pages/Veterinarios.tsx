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
import { PlusCircle, Search, Stethoscope, User, Briefcase, Hospital, IdCard } from "lucide-react";
import RoleFilter from "@/components/RoleFilter";
import VeterinarianDetailsDialog from "@/components/VeterinarianDetailsDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CustomTeamCalendar from "@/components/CustomTeamCalendar"; // Importado o novo componente

interface Veterinario {
  id: string;
  name: string;
  crmv: string;
  email: string;
  phone: string;
  role: string;
}

const mockVeterinarios: Veterinario[] = [
  { id: "V001", name: "Dr. Ana Paula", crmv: "CRMV-SP 12345", email: "ana.paula@example.com", phone: "(11) 99999-8888", role: "Veterinário" },
  { id: "V002", name: "Dr. Carlos Eduardo", crmv: "CRMV-RJ 67890", email: "carlos.eduardo@example.com", phone: "(21) 98888-7777", role: "Veterinário" },
  { id: "V003", name: "Dra. Beatriz Lima", crmv: "CRMV-MG 11223", email: "beatriz.lima@example.com", phone: "(31) 97777-6666", role: "Veterinário" },
  { id: "V004", name: "Mariana Costa", crmv: "N/A", email: "mariana.c@example.com", phone: "(11) 91234-5678", role: "Recepcionista" },
  { id: "V005", name: "Fernando Alves", crmv: "N/A", email: "fernando.a@example.com", phone: "(21) 98765-4321", role: "Gerente" },
  { id: "V006", name: "Lucas Pereira", crmv: "CRMV-SP 98765", email: "lucas.p@example.com", phone: "(11) 97654-3210", role: "Estagiário" },
];

const roleIconMap: { [key: string]: React.ElementType } = {
  Veterinário: Stethoscope,
  Recepcionista: User,
  Gerente: Briefcase,
  Estagiário: Hospital,
  Outros: IdCard,
};

const Veterinarios = () => {
  const [selectedRole, setSelectedRole] = React.useState<string>("all");
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState<boolean>(false);
  const [selectedVeterinarian, setSelectedVeterinarian] = React.useState<Veterinario | null>(null);
  const [activeTab, setActiveTab] = React.useState<string>("equipe");

  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
  };

  const filteredVeterinarios = mockVeterinarios.filter((vet) => {
    const matchesRole = selectedRole === "all" || vet.role === selectedRole;
    const matchesSearch =
      vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.crmv.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleRowClick = (vet: Veterinario) => {
    setSelectedVeterinarian(vet);
    setIsDetailsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end"> {/* Alterado para justify-end */}
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Membro
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="equipe" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Equipe</TabsTrigger>
          <TabsTrigger value="escala" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Escala</TabsTrigger>
        </TabsList>

        <TabsContent value="escala" className="mt-4">
          <CustomTeamCalendar veterinarians={mockVeterinarios} /> {/* Usando o novo componente */}
        </TabsContent>

        <TabsContent value="equipe" className="mt-4">
          <RoleFilter selectedRole={selectedRole} onSelectRole={handleSelectRole} />

          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar membros da equipe..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">Filtrar</Button>
          </div>

          <div className="rounded-md border mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>CRMV</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVeterinarios.length > 0 ? (
                  filteredVeterinarios.map((vet) => {
                    const IconComponent = roleIconMap[vet.role] || IdCard;
                    return (
                      <TableRow key={vet.id} onClick={() => handleRowClick(vet)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-bold">{vet.name}</TableCell>
                        <TableCell className="flex items-center">
                          <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                          {vet.role}
                        </TableCell>
                        <TableCell>{vet.crmv}</TableCell>
                        <TableCell>{vet.email}</TableCell>
                        <TableCell>{vet.phone}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum membro da equipe encontrado para o cargo selecionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <VeterinarianDetailsDialog
        veterinarian={selectedVeterinarian}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
      />
    </div>
  );
};

export default Veterinarios;