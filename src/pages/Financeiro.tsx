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

const mockFinanceiro = [
  { id: "F001", description: "Consulta Veterinária", type: "Receita", amount: "R$ 150,00", date: "2024-10-26" },
  { id: "F002", description: "Compra de Medicamentos", type: "Despesa", amount: "R$ 80,00", date: "2024-10-25" },
  { id: "F003", description: "Vacinação", type: "Receita", amount: "R$ 120,00", date: "2024-10-24" },
];

const Financeiro = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Financeiro</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Transação
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar transações..." className="pl-9" />
        </div>
        <Button variant="outline">Filtrar</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockFinanceiro.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.amount}</TableCell>
                <TableCell>{item.date}</TableCell>
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

export default Financeiro;