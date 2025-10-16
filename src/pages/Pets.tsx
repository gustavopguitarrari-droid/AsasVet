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

const mockPets = [
  { id: "A001", name: "Rex", species: "Cachorro", breed: "Labrador", owner: "João Silva" },
  { id: "A002", name: "Miau", species: "Gato", breed: "Siamês", owner: "Maria Souza" },
  { id: "A003", name: "Pingo", species: "Pássaro", breed: "Periquito", owner: "Pedro Santos" },
];

const Pets = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Animais</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Animal
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar animais..." className="pl-9" />
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
            {mockPets.map((pet) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Pets;