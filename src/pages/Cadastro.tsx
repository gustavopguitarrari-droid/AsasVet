"use client";

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
import { PlusCircle, Search, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, Users as UsersIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SpeciesFilter from "@/components/SpeciesFilter";
import PetDetailsDialog from "@/components/PetDetailsDialog";

// Mock de dados para Animais (copiado de src/pages/Pets.tsx)
interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  owner: string;
}

const mockPets: Pet[] = [
  { id: "A001", name: "Rex", species: "Cachorro", breed: "Labrador", owner: "João Silva" },
  { id: "A002", name: "Miau", species: "Gato", breed: "Siamês", owner: "Maria Souza" },
  { id: "A003", name: "Pingo", species: "Pássaro", breed: "Periquito", owner: "Pedro Santos" },
  { id: "A004", name: "Fido", species: "Cachorro", breed: "Poodle", owner: "Ana Costa" },
  { id: "A005", name: "Whiskers", species: "Gato", breed: "Persa", owner: "Carlos Lima" },
  { id: "A006", name: "Pipoca", species: "Roedor", breed: "Hamster", owner: "Fernanda Reis" },
  { id: "A007", name: "Nemo", species: "Peixe", breed: "Peixe-palhaço", owner: "Lucas Mendes" },
  { id: "A008", name: "Bolt", species: "Cachorro", breed: "Golden Retriever", owner: "Mariana Santos" },
];

// Mapeamento de espécies para ícones (copiado de src/pages/Pets.tsx)
const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
};

// Mock de dados para Tutores (copiado de src/pages/Clients.tsx)
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

const mockClients: Client[] = [
  { id: "1", name: "João Silva", email: "joao.silva@example.com", phone: "(11) 98765-4321" },
  { id: "2", name: "Maria Souza", email: "maria.souza@example.com", phone: "(21) 91234-5678" },
  { id: "3", name: "Pedro Santos", email: "pedro.santos@example.com", phone: "(31) 99876-1234" },
];

const Cadastro = () => {
  // Estados para a aba de Animais
  const [selectedSpecies, setSelectedSpecies] = React.useState<string>("all");
  const [petSearchTerm, setPetSearchTerm] = React.useState<string>("");
  const [isPetDetailsDialogOpen, setIsPetDetailsDialogOpen] = React.useState<boolean>(false);
  const [selectedPet, setSelectedPet] = React.useState<Pet | null>(null);

  // Estados para a aba de Tutores
  const [clientSearchTerm, setClientSearchTerm] = React.useState<string>("");

  const handleSelectSpecies = (species: string) => {
    setSelectedSpecies(species);
  };

  const filteredPets = mockPets.filter((pet) => {
    const matchesSpecies = selectedSpecies === "all" || pet.species === selectedSpecies;
    const matchesSearch =
      pet.name.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
      pet.owner.toLowerCase().includes(petSearchTerm.toLowerCase());
    return matchesSpecies && matchesSearch;
  });

  const handlePetRowClick = (pet: Pet) => {
    setSelectedPet(pet);
    setIsPetDetailsDialogOpen(true);
  };

  const filteredClients = mockClients.filter((client) =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.phone.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Cadastro de novos tutores e animais</h2>
        <Button className="font-bold">
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Animal
        </Button>
      </div>

      <Tabs defaultValue="tutores" className="w-full"> {/* Alterado defaultValue para "tutores" */}
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="tutores" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold"> {/* Aba Tutores primeiro */}
            <UsersIcon className="h-5 w-5 mr-2" /> Tutores
          </TabsTrigger>
          <TabsTrigger value="animais" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold"> {/* Aba Animais segundo */}
            <Dog className="h-5 w-5 mr-2" /> Animais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tutores" className="mt-4"> {/* Conteúdo de Tutores primeiro */}
          <div className="flex items-center justify-end mb-4">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Tutor
            </Button>
          </div>

          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar tutores..." className="pl-9" value={clientSearchTerm} onChange={(e) => setClientSearchTerm(e.target.value)} />
            </div>
            <Button variant="outline">Filtrar</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.id}</TableCell>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum tutor encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="animais" className="mt-4"> {/* Conteúdo de Animais segundo */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <SpeciesFilter selectedSpecies={selectedSpecies} onSelectSpecies={handleSelectSpecies} />
          </div>

          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar animais..."
                className="pl-9"
                value={petSearchTerm}
                onChange={(e) => setPetSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">Filtrar</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Espécie</TableHead>
                  <TableHead>Raça</TableHead>
                  <TableHead>Dono</TableHead>
                  <TableHead>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPets.length > 0 ? (
                  filteredPets.map((pet) => {
                    const IconComponent = speciesIconMap[pet.species] || MoreHorizontal;
                    return (
                      <TableRow key={pet.id} onClick={() => handlePetRowClick(pet)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-bold">{pet.name}</TableCell>
                        <TableCell className="flex items-center">
                          <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                          {pet.species}
                        </TableCell>
                        <TableCell>{pet.breed}</TableCell>
                        <TableCell>{pet.owner}</TableCell>
                        <TableCell>{pet.id}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum animal encontrado para a espécie selecionada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <PetDetailsDialog
            pet={selectedPet}
            isOpen={isPetDetailsDialogOpen}
            onClose={() => setIsPetDetailsDialogOpen(false)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Cadastro;