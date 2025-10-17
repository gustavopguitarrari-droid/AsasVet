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

const mockMedicalRecords = [
  { id: "MR001", pet: "Rex", date: "2024-10-20", veterinarian: "Dr. Ana", diagnosis: "Gripe Canina" },
  { id: "MR002", pet: "Miau", date: "2024-10-15", veterinarian: "Dr. Carlos", diagnosis: "Check-up Anual" },
  { id: "MR003", pet: "Pingo", date: "2024-10-10", veterinarian: "Dr. Ana", diagnosis: "Pena Quebrada" },
];

const AgendamentosMedicos = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Agenda</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Agendamento
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar agendamentos..." className="pl-9" />
        </div>
        <Button variant="outline">Filtrar</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Animal</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Veterinário</TableHead>
              <TableHead>Diagnóstico</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockMedicalRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.id}</TableCell>
                <TableCell>{record.pet}</TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.veterinarian}</TableCell>
                <TableCell>{record.diagnosis}</TableCell>
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

export default AgendamentosMedicos;