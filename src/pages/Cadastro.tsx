"use client";

import React, { useState, useEffect } from "react";
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
import { PlusCircle, Search, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, Users as UsersIcon, Home, Calendar, IdCard, Mail, Phone, MapPin, Eye } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SpeciesFilter from "@/components/SpeciesFilter";
import PetDetailsDialog from "@/components/PetDetailsDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import ClientForm, { ClientFormValues } from "@/components/ClientForm";
import PetForm, { PetFormValues } from "@/components/PetForm"; // Importar PetForm
import { Client, Pet } from "@/types/cadastro";
import { format, parseISO, isValid } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area"; // Importar ScrollArea

// Mock de dados iniciais
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
    observations: "Tutor muito atencioso, sempre busca o melhor para seus pets.",
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
    observations: "Prefere contato por e-mail. Tem 2 gatos.",
    photoUrl: undefined,
  },
];

const initialMockPets: Pet[] = [
  { id: "A001", name: "Rex", species: "Cachorro", breed: "Labrador", age: "5 anos", gender: "Macho", color: "Dourado", observations: "Muito brincalhão, adora passear.", photoUrl: undefined, ownerId: "CL001" },
  { id: "A002", name: "Miau", species: "Gato", breed: "Siamês", age: "2 anos", gender: "Fêmea", color: "Creme e Marrom", observations: "Um pouco arisca com estranhos.", photoUrl: undefined, ownerId: "CL002" },
  { id: "A003", name: "Pingo", species: "Pássaro", breed: "Periquito", age: "1 ano", gender: "Macho", color: "Verde", observations: "Canta bastante pela manhã.", photoUrl: undefined, ownerId: "CL001" },
  { id: "A004", name: "Fido", species: "Cachorro", breed: "Poodle", age: "8 meses", gender: "Macho", color: "Branco", observations: "Filhote, em fase de adestramento.", photoUrl: undefined, ownerId: "CL001" },
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
  const [activeTab, setActiveTab] = useState<string>("tutores");
  const [clients, setClients] = useState<Client[]>(initialMockClients);
  const [pets, setPets] = useState<Pet[]>(initialMockPets);

  // Estados para a aba de Animais
  const [selectedSpecies, setSelectedSpecies] = useState<string>("all");
  const [petSearchTerm, setPetSearchTerm] = useState<string>("");
  const [isPetDetailsDialogOpen, setIsPetDetailsDialogOpen] = useState<boolean>(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isAddPetDialogOpen, setIsAddPetDialogOpen] = useState<boolean>(false);
  const [defaultOwnerIdForPet, setDefaultOwnerIdForPet] = useState<string | undefined>(undefined);

  // Estados para a aba de Tutores
  const [clientSearchTerm, setClientSearchTerm] = useState<string>("");
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState<boolean>(false);
  const [isClientPetsDialogOpen, setIsClientPetsDialogOpen] = useState<boolean>(false);
  const [clientToViewPets, setClientToViewPets] = useState<Client | null>(null);

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
      observations: data.observations,
      photoUrl: data.photoUrl,
    };
    setClients((prev) => [...prev, newClient]);
    setIsAddClientDialogOpen(false);
  };

  const handleAddPet = (data: PetFormValues) => {
    const newPetId = `A${(pets.length + 1).toString().padStart(3, '0')}`;
    const newPet: Pet = {
      id: newPetId,
      name: data.name,
      species: data.species,
      breed: data.breed,
      age: data.age,
      gender: data.gender,
      color: data.color,
      observations: data.observations,
      photoUrl: data.photoUrl,
      ownerId: data.ownerId,
    };
    setPets((prev) => [...prev, newPet]);
    setIsAddPetDialogOpen(false);
    // Se o diálogo de pets do cliente estiver aberto, atualiza-o
    if (isClientPetsDialogOpen && clientToViewPets?.id === data.ownerId) {
      setClientToViewPets(prev => prev ? { ...prev } : null); // Força a re-renderização para atualizar a lista de pets
    }
  };

  const filteredPets = pets.filter((pet) => {
    const matchesSpecies = selectedSpecies === "all" || pet.species === selectedSpecies;
    const owner = clients.find(client => client.id === pet.ownerId);
    const matchesSearch =
      pet.name.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(petSearchTerm.toLowerCase()) ||
      (owner?.name.toLowerCase().includes(petSearchTerm.toLowerCase()));
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

  const handleViewClientPets = (client: Client) => {
    setClientToViewPets(client);
    setIsClientPetsDialogOpen(true);
  };

  const handleAddPetForClient = (clientId: string) => {
    setDefaultOwnerIdForPet(clientId);
    setIsAddPetDialogOpen(true);
    setIsClientPetsDialogOpen(false); // Fecha o diálogo de pets do cliente
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Cadastro de Tutores e Animais</h2>
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
                key={isAddClientDialogOpen ? "open" : "closed"}
                onSubmit={handleAddClient}
                onCancel={() => setIsAddClientDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
        {activeTab === "animais" && (
          <Dialog open={isAddPetDialogOpen} onOpenChange={setIsAddPetDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-bold" disabled={clients.length === 0}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Animal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Animal</DialogTitle>
              </DialogHeader>
              <PetForm
                key={isAddPetDialogOpen ? "open" : "closed"}
                onSubmit={handleAddPet}
                onCancel={() => setIsAddPetDialogOpen(false)}
                allClients={clients}
                defaultOwnerId={defaultOwnerIdForPet}
              />
            </DialogContent>
          </Dialog>
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
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => {
                    return (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.cpf}</TableCell>
                        <TableCell>
                          {client.dateOfBirth && isValid(parseISO(client.dateOfBirth))
                            ? format(parseISO(client.dateOfBirth), "dd/MM/yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <p className="flex items-center text-sm"><Mail className="h-3 w-3 mr-1 text-muted-foreground" /> {client.email}</p>
                          <p className="flex items-center text-sm"><Phone className="h-3 w-3 mr-1 text-muted-foreground" /> {client.phone}</p>
                        </TableCell>
                        <TableCell>
                          <p className="flex items-center text-sm"><Home className="h-3 w-3 mr-1 text-muted-foreground" /> {client.address.street}, {client.address.number} {client.address.complement}</p>
                          <p className="flex items-center text-sm"><MapPin className="h-3 w-3 mr-1 text-muted-foreground" /> {client.address.neighborhood}, {client.address.city} - {client.address.state}</p>
                          <p className="text-xs text-muted-foreground ml-4">CEP: {client.address.cep}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleViewClientPets(client)}>
                            <Eye className="h-4 w-4 mr-2" /> Ver Animais
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
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
                placeholder="Buscar animais por nome, raça ou tutor..."
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
                  <TableHead>Idade</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPets.length > 0 ? (
                  filteredPets.map((pet) => {
                    const IconComponent = speciesIconMap[pet.species] || MoreHorizontal;
                    const owner = clients.find(client => client.id === pet.ownerId);
                    return (
                      <TableRow key={pet.id} onClick={() => handlePetRowClick(pet)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-bold flex items-center">
                          <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                          {pet.name}
                        </TableCell>
                        <TableCell>{pet.species}</TableCell>
                        <TableCell>{pet.breed}</TableCell>
                        <TableCell>{owner ? owner.name : "N/A"}</TableCell>
                        <TableCell>{pet.age}</TableCell>
                        <TableCell>{pet.gender}</TableCell>
                        <TableCell>{pet.color}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handlePetRowClick(pet); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
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

      {/* Diálogo para ver os animais de um tutor específico */}
      <Dialog open={isClientPetsDialogOpen} onOpenChange={setIsClientPetsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Animais de {clientToViewPets?.name}</DialogTitle>
            <DialogDescription>
              Lista de todos os animais vinculados a {clientToViewPets?.name}.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 p-4 border rounded-md bg-muted/20 mb-4">
            {clientToViewPets ? (
              (() => {
                const petsOfClient = pets.filter(pet => pet.ownerId === clientToViewPets.id);
                return petsOfClient.length > 0 ? (
                  <div className="space-y-3">
                    {petsOfClient.map(pet => {
                      const IconComponent = speciesIconMap[pet.species] || MoreHorizontal;
                      return (
                        <div key={pet.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                          <div className="flex items-center">
                            <IconComponent className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{pet.name} ({pet.species})</p>
                              <p className="text-sm text-muted-foreground">Raça: {pet.breed} | Idade: {pet.age}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handlePetRowClick(pet)}>
                            <Eye className="h-4 w-4 mr-2" /> Detalhes
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">Nenhum animal cadastrado para este tutor.</p>
                );
              })()
            ) : (
              <p className="text-center text-muted-foreground">Selecione um tutor para ver seus animais.</p>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClientPetsDialogOpen(false)}>Fechar</Button>
            <Button onClick={() => handleAddPetForClient(clientToViewPets!.id)} disabled={!clientToViewPets}>
              <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Animal para {clientToViewPets?.name}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cadastro;