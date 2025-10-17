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
import { PlusCircle, Search } from "lucide-react";
import SpeciesFilter from "@/components/SpeciesFilter"; // Importa o novo componente de filtro

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

const Pets = () => {
  const [selectedSpecies, setSelectedSpecies] = React.useState<string>("all");
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const handleSelectSpecies = (species: string) => {
    setSelectedSpecies(species);
  };

  const filteredPets = mockPets.filter((pet) => {
    const matchesSpecies = selectedSpecies === "all" || pet.species === selectedSpecies;
    const matchesSearch =
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.owner.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSpecies && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Animais</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Animal
        </Button>
      </div>

      <SpeciesFilter selectedSpecies={selectedSpecies} onSelectSpecies={handleSelectSpecies} />

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar animais..."
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
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Espécie</TableHead>
              <TableHead>Raça</TableHead>
              <TableHead>Dono</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPets.length > 0 ? (
              filteredPets.map((pet) => (
                <TableRow key={pet.id}>
                  <TableCell className="font-medium">{pet.id}</TableCell>
                  <TableCell>{pet.name}</TableCell>
                  <TableCell>{pet.species}</TableCell>
                  <TableCell>{pet.breed}</TableCell>
                  <TableCell>{pet.owner}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhum animal encontrado para a espécie selecionada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Pets;