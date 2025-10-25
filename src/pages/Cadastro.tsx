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
import { PlusCircle, Search, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, Users as UsersIcon, Home, Calendar, IdCard } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SpeciesFilter from "@/components/SpeciesFilter";
import PetDetailsDialog from "@/components/PetDetailsDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ClientForm, { ClientFormValues } from "@/components/ClientForm";
import { Client, Pet } from "@/types/cadastro";
import { format } from "date-fns";

// Mock de dados para Tutores
const initialMockClients: Client[] = [
  {
    id: "CL001",
    name: "João Silva",
    email: "joao.silva@example.com",
    phone: "(11) 98765-4321",
    cpf: "123.456.789-00",
    dateOfBirth: "1985-03-10",
    address: {
      cep: "01001-000",
      street: "Praça da Sé",
      number: "S/N",
      complement: "lado ímpar",
      neighborhood: "Sé",
      city: "São Paulo",
      state: "SP",
    },
    photoUrl: undefined,
  },
  {
    id: "CL002",
    name: "Maria Souza",
    email: "maria.souza@example.com",
    phone: "(21) 91234-5678",
    cpf: "987.654.321-00",
    dateOfBirth: "1990-07-22",
    address: {
      cep: "20040-009",
      street: "Rua da Assembleia",
      number: "10",
      complement: "sala 1001",
      neighborhood: "Centro",
      city: "Rio de Janeiro",
      state: "RJ",
    },
    photoUrl: undefined,
  },
  {
    id: "CL003",
    name: "Pedro Santos",
    email: "pedro.santos@example.com",
    phone: "(31) 99876-1234",
    cpf: "111.222.333-44",
    dateOfBirth: "1978-11-05",
    address: {
      cep: "30130-000",
      street: "Avenida Afonso Pena",
      number: "500",
      complement: "",
      neighborhood: "Centro",
      city: "Belo Horizonte",
      state: "MG",
    },
    photoUrl: undefined,
  },
];

// Mock de dados para Animais
const initialMockPets: Pet[] = [
  { id: "A001", name: "Rex", species: "Cachorro", breed: "Labrador", ownerId: "CL001" },
  { id: "A002", name: "Miau", species: "Gato", breed: "Siamês", ownerId: "CL002" },
  { id: "A003", name: "Pingo", species: "Pássaro", breed: "Periquito", ownerId: "CL003" },
  { id: "A004", name: "Fido", species: "Cachorro", breed: "Poodle", ownerId: "CL001" },
  { id: "A005", name: "Whiskers", species: "Gato", breed: "Persa", ownerId: "CL002" },
  { id: "A006", name: "Pipoca", species: "Roedor", breed: "Hamster", ownerId: "CL003" },
  { id: "A007", name: "Nemo", species: "Peixe", breed: "Peixe-palhaço", ownerId: "CL001" },
  { id: "A008", name: "Bolt", species: "Cachorro", breed: "Golden Retriever", ownerId: "CL002" },
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

const Cadastro = () => {
  const [activeTab, setActiveTab] = React.useState<string>("tutores");
  const [clients, setClients] = React.useState<Client[]>(initialMockClients);
  const [pets, setPets] = React.useState<Pet[]>(initialMockPets);

  // Estados para a aba de Animais
  const [selectedSpecies, setSelectedSpecies] = React.useState<string>("all");
  const [petSearchTerm, setPetSearchTerm] = React.useState<string>("");
  const [isPetDetailsDialogOpen, setIsPetDetailsDialogOpen] = React.useState<boolean>(false);
  const [selectedPet, setSelectedPet] = React.useState<Pet | null>(null);

  // Estados para a aba de Tutores
  const [clientSearchTerm, setClientSearchTerm] = React.useState<string>("");
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = React.useState<boolean>(false);

  const handleSelectSpecies = (species: string) => {
    setSelectedSpecies(species);
  };

  const handleAddClient = (data: ClientFormValues) => {
    const newClientId = `CL${(clients.length + 1).toString().padStart(3, '0')}`;
    const newClient: Client = {
      id: newClientId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
      dateOfBirth: format(data.dateOfBirth, "yyyy-MM-dd"),
      address: data.address,
      photoUrl: data.photoUrl,
    };
    setClients((prev) => [...prev, newClient]);

    // Atualiza os pets selecionados para terem o novo ownerId
    if (data.associatedPetIds && data.associatedPetIds.length > 0) {
      setPets((prevPets) =>
        prevPets.map((pet) =>
          data.associatedPetIds?.includes(pet.id)
            ? { ...pet, ownerId: newClientId } // Associa o pet ao novo tutor
            : pet
        )
      );
    }
    setIsAddClientDialogOpen(false);
  };

  const filteredPets = pets.filter((pet) => {
    const matchesSpecies = selectedSpecies === "all" || pet.species === selectedSpecies;
    const matchesSearch =
      pet.name.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
      clients.find(client => client.id === pet.ownerId)?.name.toLowerCase().includes(petSearchTerm.toLowerCase()); // Busca pelo nome do tutor
    return matchesSpecies && matchesSearch;
  });

  const handlePetRowClick = (pet: Pet) => {
    setSelectedPet(pet);
    setIsPetDetailsDialogOpen(true);
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.phone.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.cpf.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.address.city.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.address.state.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Cadastro de novos tutores e animais</h2>
        {activeTab === "tutores" && (
          <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-bold">
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Tutor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Tutor</DialogTitle>
              </DialogHeader>
              <ClientForm
                onSubmit={handleAddClient}
                onCancel={() => setIsAddClientDialogOpen(false)}
                allPets={pets}
              />
            </DialogContent>
          </Dialog>
        )}
        {activeTab === "animais" && (
          <Button className="font-bold">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Animal
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="tutores" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">
            <UsersIcon className="h-5 w-5 mr-2" /> Tutores
          </TabsTrigger>
          <TabsTrigger value="animais" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">
            <Dog className="h-5 w-5 mr-2" /> Animais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tutores" className="mt-4">
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar tutores por nome, email, telefone, CPF ou cidade..." className="pl-9" value={clientSearchTerm} onChange={(e) => setClientSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Nascimento</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Animais</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => {
                    const associatedPets = pets.filter(pet => pet.ownerId === client.id);
                    return (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.cpf}</TableCell>
                        <TableCell>{format(new Date(client.dateOfBirth), "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          <p className="flex items-center text-sm"><Mail className="h-3 w-3 mr-1 text-muted-foreground" /> {client.email}</p>
                          <p className="flex items-center text-sm"><Phone className="h-3 w-3 mr-1 text-muted-foreground" /> {client.phone}</p>
                        </TableCell>
                        <TableCell>
                          <p className="flex items-center text-sm"><Home className="h-3 w-3 mr-1 text-muted-foreground" /> {client.address.street}, {client.address.number} {client.address.complement}</p>
                          <p className="flex items-center text-sm"><MapPin className="h-3 w-3 mr-1 text-muted-foreground" /> {client.address.neighborhood}, {client.address.city} - {client.address.state}</p>
                          <p className="text-xs text-muted-foreground ml-4">CEP: {client.address.cep}</p>
                        </TableCell>
                        <TableCell>
                          {associatedPets.length > 0 ? (
                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                              {associatedPets.map(pet => <li key={pet.id}>{pet.name} ({pet.species})</li>)}
                            </ul>
                          ) : (
                            <span className="text-muted-foreground text-sm">Nenhum animal</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Nenhum tutor encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="animais" className="mt-4">
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
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Espécie</TableHead>
                  <TableHead>Raça</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPets.length > 0 ? (
                  filteredPets.map((pet) => {
                    const IconComponent = speciesIconMap[pet.species] || MoreHorizontal;
                    const owner = clients.find(client => client.id === pet.ownerId);
                    return (
                      <TableRow key={pet.id} onClick={() => handlePetRowClick(pet)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-bold">{pet.name}</TableCell>
                        <TableCell className="flex items-center">
                          <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                          {pet.species}
                        </TableCell>
                        <TableCell>{pet.breed}</TableCell>
                        <TableCell>{owner ? owner.name : "N/A"}</TableCell>
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
            pet={selectedPet ? { ...selectedPet, owner: clients.find(c => c.id === selectedPet.ownerId)?.name || "N/A" } : null}
            isOpen={isPetDetailsDialogOpen}
            onClose={() => setIsPetDetailsDialogOpen(false)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Cadastro;