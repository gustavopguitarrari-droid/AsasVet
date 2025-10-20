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
import { PlusCircle, Search, Package } from "lucide-react";

interface ItemEstoque {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  lastUpdate: string;
}

const mockEstoque: ItemEstoque[] = [
  { id: "IT001", name: "Ração para Cães Adultos", category: "Alimentos", quantity: 50, unit: "sacos", lastUpdate: "2024-10-20" },
  { id: "IT002", name: "Vacina V8", category: "Medicamentos", quantity: 120, unit: "doses", lastUpdate: "2024-10-25" },
  { id: "IT003", name: "Shampoo para Gatos", category: "Higiene", quantity: 30, unit: "unidades", lastUpdate: "2024-10-22" },
  { id: "IT004", name: "Antibiótico Amoxicilina", category: "Medicamentos", quantity: 75, unit: "caixas", lastUpdate: "2024-10-24" },
];

const Estoque = () => {
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const filteredEstoque = mockEstoque.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Estoque</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar itens no estoque..."
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
              <TableHead>Nome do Item</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEstoque.length > 0 ? (
              filteredEstoque.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.lastUpdate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum item encontrado no estoque.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Estoque;