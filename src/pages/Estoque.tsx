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
import { PlusCircle, Search, Package, Wheat, Pill, SprayCan, Wrench, MoreHorizontal } from "lucide-react";
import CategoryFilter from "@/components/CategoryFilter"; // Importa o novo componente de filtro
import StockItemDetailsDialog from "@/components/StockItemDetailsDialog"; // Importa o novo componente de diálogo
import { cn } from "@/lib/utils"; // Importa cn para classes condicionais

interface ItemEstoque {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  lastUpdate: string;
}

const mockEstoque: ItemEstoque[] = [
  { id: "IT001", name: "Ração para Cães Adultos", category: "Insumos", quantity: 50, unit: "sacos", lastUpdate: "2024-10-20" },
  { id: "IT002", name: "Vacina V8", category: "Medicamentos", quantity: 120, unit: "doses", lastUpdate: "2024-10-25" },
  { id: "IT003", name: "Shampoo para Gatos", category: "Higiene", quantity: 30, unit: "unidades", lastUpdate: "2024-10-22" },
  { id: "IT004", name: "Antibiótico Amoxicilina", category: "Medicamentos", quantity: 75, unit: "caixas", lastUpdate: "2024-10-24" },
  { id: "IT005", name: "Seringas 5ml", category: "Equipamentos", quantity: 200, unit: "unidades", lastUpdate: "2024-10-23" },
  { id: "IT006", name: "Brinquedo para Gatos", category: "Outros", quantity: 40, unit: "unidades", lastUpdate: "2024-10-21" },
  { id: "IT007", name: "Luvas Cirúrgicas", category: "Equipamentos", quantity: 100, unit: "pares", lastUpdate: "2024-10-26" },
  { id: "IT008", name: "Petisco para Cães", category: "Insumos", quantity: 80, unit: "pacotes", lastUpdate: "2024-10-27" },
];

// Mapeamento de categorias para ícones para a tabela
const categoryIconMap: { [key: string]: React.ElementType } = {
  Insumos: Wheat,
  Medicamentos: Pill,
  Higiene: SprayCan,
  Equipamentos: Wrench,
  Outros: MoreHorizontal,
};

const Estoque = () => {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState<boolean>(false);
  const [selectedItem, setSelectedItem] = React.useState<ItemEstoque | null>(null);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  const filteredEstoque = mockEstoque.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRowClick = (item: ItemEstoque) => {
    setSelectedItem(item);
    setIsDetailsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Estoque</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
        </Button>
      </div>

      <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={handleSelectCategory} />

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
              <TableHead>Nome do Item</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead>ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEstoque.length > 0 ? (
              filteredEstoque.map((item) => {
                const IconComponent = categoryIconMap[item.category] || Package;
                return (
                  <TableRow key={item.id} onClick={() => handleRowClick(item)} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-bold">{item.name}</TableCell>
                    <TableCell className="flex items-center">
                      <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                      {item.category}
                    </TableCell>
                    <TableCell>{item.quantity} {item.unit}</TableCell>
                    <TableCell>{item.lastUpdate}</TableCell>
                    <TableCell>{item.id}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum item encontrado no estoque para a categoria selecionada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <StockItemDetailsDialog
        item={selectedItem}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
      />
    </div>
  );
};

export default Estoque;