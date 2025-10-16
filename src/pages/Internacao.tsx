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
import { PlusCircle, Search, Bed } from "lucide-react";

const mockInternacao = [
  { id: "I001", pet: "Rex", owner: "João Silva", reason: "Pós-cirúrgico", admissionDate: "2024-10-25", status: "Internado" },
  { id: "I002", pet: "Miau", owner: "Maria Souza", reason: "Observação", admissionDate: "2024-10-26", status: "Internado" },
  { id: "I003", pet: "Bolinha", owner: "Ana Costa", reason: "Tratamento", admissionDate: "2024-10-24", status: "Alta Prevista" },
];

const Internacao = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Internação</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Internação
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar internações..." className="pl-9" />
        </div>
        <Button variant="outline">Filtrar</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Animal</TableHead>
              <TableHead>Proprietário</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Data Admissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockInternacao.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>{item.pet}</TableCell>
                <TableCell>{item.owner}</TableCell>
                <TableCell>{item.reason}</TableCell>
                <TableCell>{item.admissionDate}</TableCell>
                <TableCell>{item.status}</TableCell>
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

export default Internacao;