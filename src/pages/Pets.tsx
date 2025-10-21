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
import { PlusCircle, Search, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal } from "lucide-react";
import SpeciesFilter from "@/components/SpeciesFilter";
import PetDetailsDialog from "@/components/PetDetailsDialog"; // Importa o novo componente de diálogo

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

// Mapeamento de espécies para ícones
const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
};

const Pets = () => {
  const [selectedSpecies, setSelectedSpecies] = React.useState<string>("all");
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState<boolean>(false);
  const [selectedPet, setSelectedPet] = React.useState<Pet | null>(null);

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

  const handleRowClick = (pet: Pet) => {
    setSelectedPet(pet);
    setIsDetailsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4"> {/* Novo contêiner flexível */}
        <SpeciesFilter selectedSpecies={selectedSpecies} onSelectSpecies={handleSelectSpecies} />
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Animal
        </Button>
      </div>

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
                  <TableRow key={pet.id} onClick={() => handleRowClick(pet)} className="cursor-pointer hover:bg-muted/50">
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
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
      />
    </div>
  );
};

export default Pets;