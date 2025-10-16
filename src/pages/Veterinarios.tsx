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
import { PlusCircle, Search, Stethoscope } from "lucide-react";

const mockVeterinarios = [
  { id: "V001", name: "Dr. Ana Paula", crmv: "CRMV-SP 12345", email: "ana.paula@example.com", phone: "(11) 99999-8888" },
  { id: "V002", name: "Dr. Carlos Eduardo", crmv: "CRMV-RJ 67890", email: "carlos.eduardo@example.com", phone: "(21) 98888-7777" },
  { id: "V003", name: "Dra. Beatriz Lima", crmv: "CRMV-MG 11223", email: "beatriz.lima@example.com", phone: "(31) 97777-6666" },
];

const Veterinarios = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Veterinários</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Veterinário
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar veterinários..." className="pl-9" />
        </div>
        <Button variant="outline">Filtrar</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>CRMV</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockVeterinarios.map((vet) => (
              <TableRow key={vet.id}>
                <TableCell className="font-medium">{vet.id}</TableCell>
                <TableCell>{vet.name}</TableCell>
                <TableCell>{vet.crmv}</TableCell>
                <TableCell>{vet.email}</TableCell>
                <TableCell>{vet.phone}</TableCell>
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

export default Veterinarios;