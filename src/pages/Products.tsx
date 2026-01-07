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
import { PlusCircle, Search, Package, Tag, Edit, Trash2, ListFilter, DollarSign, Wheat, Pill, SprayCan, Wrench, MoreHorizontal, Syringe } from "lucide-react";
import CategoryFilter, { FilterOption } from "@/components/CategoryFilter";
import AddProductDialog, { AddProductFormValues } from "@/components/cashier/AddProductDialog";
import { Product } from "@/types/cashier";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { showError, showSuccess } from "@/utils/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle as AlertDialogTitleComponent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePageTitle } from "@/context/PageTitleContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StockItemDetailsDialog from "@/components/StockItemDetailsDialog";
import { cn } from "@/lib/utils";

// --- Tipos e Mocks para a aba de Estoque ---
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
  { id: "IT002", name: "Vacina V8", category: "Farmácia", quantity: 120, unit: "doses", lastUpdate: "2024-10-25" },
  { id: "IT003", name: "Shampoo para Gatos", category: "Higiene", quantity: 30, unit: "unidades", lastUpdate: "2024-10-22" },
  { id: "IT004", name: "Antibiótico Amoxicilina", category: "Farmácia", quantity: 75, unit: "caixas", lastUpdate: "2024-10-24" },
  { id: "IT005", name: "Seringas 5ml", category: "Equipamentos", quantity: 200, unit: "unidades", lastUpdate: "2024-10-23" },
  { id: "IT006", name: "Brinquedo para Gatos", category: "Outros", quantity: 40, unit: "unidades", lastUpdate: "2024-10-21" },
  { id: "IT007", name: "Luvas Cirúrgicas", category: "Equipamentos", quantity: 100, unit: "pares", lastUpdate: "2024-10-26" },
  { id: "IT008", name: "Petisco para Cães", category: "Insumos", quantity: 80, unit: "pacotes", lastUpdate: "2024-10-27" },
];

const stockCategoryIconMap: { [key: string]: React.ElementType } = {
  Insumos: Syringe,
  Farmácia: Pill,
  Higiene: SprayCan,
  Equipamentos: Wrench,
  Outros: MoreHorizontal,
};

const stockCategoryOptions: FilterOption[] = [
  { name: "Todos", icon: ListFilter, colorClass: "bg-gray-500", value: "all" },
  { name: "Insumos", icon: Syringe, colorClass: "bg-sidebar-item-bg-1", value: "Insumos" },
  { name: "Farmácia", icon: Pill, colorClass: "bg-sidebar-item-bg-4", value: "Farmácia" },
  { name: "Higiene", icon: SprayCan, colorClass: "bg-sidebar-item-bg-3", value: "Higiene" },
  { name: "Equipamentos", icon: Wrench, colorClass: "bg-sidebar-item-bg-7", value: "Equipamentos" },
  { name: "Outros", icon: MoreHorizontal, colorClass: "bg-sidebar-item-bg-9", value: "Outros" },
];

// --- Tipos para a aba de Produtos ---
const productCategoryOptions: FilterOption[] = [
  { name: "Todos", icon: ListFilter, colorClass: "bg-gray-500", value: "all" },
  { name: "Produto", icon: Package, colorClass: "bg-sidebar-item-bg-1", value: "Produto" },
  { name: "Serviço", icon: Tag, colorClass: "bg-sidebar-item-bg-4", value: "Serviço" },
];

const Products = () => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;
  const organizationId = appUser?.organizationId;
  const { setPageTitle } = usePageTitle();

  // --- Estados para a aba de Produtos ---
  const [productSearchTerm, setProductSearchTerm] = useState<string>("");
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>("all");
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | undefined>(undefined);

  // --- Estados para a aba de Estoque ---
  const [stockSearchTerm, setStockSearchTerm] = useState<string>("");
  const [selectedStockCategory, setSelectedStockCategory] = useState<string>("all");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState<boolean>(false);
  const [selectedStockItem, setSelectedStockItem] = useState<ItemEstoque | null>(null);

  useEffect(() => {
    setPageTitle("Produtos e Estoque");
    return () => setPageTitle("");
  }, [setPageTitle]);

  // --- Queries e Mutations para Produtos ---
  const { data: products = [], isLoading: isLoadingProducts, error: productsError } = useQuery<Product[]>({
    queryKey: ['products', userId, organizationId],
    queryFn: async () => {
      if (!userId || !organizationId) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!userId && !!organizationId,
  });

  const addProductMutation = useMutation({
    mutationFn: async (newProductData: AddProductFormValues) => {
      if (!userId || !organizationId) {
        throw new Error("User ID or Organization ID not available.");
      }
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: userId,
          organization_id: organizationId,
          name: newProductData.name,
          price: newProductData.price,
          category: newProductData.category,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', userId, organizationId] });
      showSuccess("Produto/Serviço adicionado com sucesso!");
      setIsAddProductDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao adicionar item: ${err.message}`);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (updatedProductData: Product) => {
      if (!userId || !organizationId) {
        throw new Error("User ID or Organization ID not available.");
      }
      const { data, error } = await supabase
        .from('products')
        .update({
          name: updatedProductData.name,
          price: updatedProductData.price,
          category: updatedProductData.category,
        })
        .eq('id', updatedProductData.id)
        .eq('organization_id', organizationId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', userId, organizationId] });
      showSuccess("Produto/Serviço atualizado com sucesso!");
      setIsEditProductDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao atualizar item: ${err.message}`);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!userId || !organizationId) {
        throw new Error("User ID or Organization ID not available.");
      }
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('organization_id', organizationId);
      if (error) throw error;
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', userId, organizationId] });
      showSuccess("Produto/Serviço excluído com sucesso!");
    },
    onError: (err) => {
      showError(`Erro ao excluir item: ${err.message}`);
    },
  });

  // --- Handlers para Produtos ---
  const handleSelectProductCategory = (category: string) => {
    setSelectedProductCategory(category);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedProductCategory === "all" || product.category === selectedProductCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.price.toFixed(2).includes(productSearchTerm);
    return matchesCategory && matchesSearch;
  });

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsEditProductDialogOpen(true);
  };

  // --- Handlers para Estoque ---
  const handleSelectStockCategory = (category: string) => {
    setSelectedStockCategory(category);
  };

  const filteredEstoque = mockEstoque.filter((item) => {
    const matchesCategory = selectedStockCategory === "all" || item.category === selectedStockCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(stockSearchTerm.toLowerCase()) ||
      item.unit.toLowerCase().includes(stockSearchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStockRowClick = (item: ItemEstoque) => {
    setSelectedStockItem(item);
    setIsDetailsDialogOpen(true);
  };

  if (isLoadingProducts) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Erro ao carregar dados: {productsError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
            Produtos & Serviços
          </TabsTrigger>
          <TabsTrigger value="stock" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold">
            Estoque
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <div className="p-4 border rounded-md bg-background shadow-md space-y-4 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between flex-wrap gap-4">
              <CategoryFilter selectedCategory={selectedProductCategory} onSelectCategory={handleSelectProductCategory} options={productCategoryOptions} />
              <div className="flex items-center space-x-2 w-full md:w-auto flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos ou serviços..."
                    className="pl-9 border border-input rounded-lg"
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                  />
                </div>
                <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="font-bold shrink-0">
                      <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                    </Button>
                  </DialogTrigger>
                  <AddProductDialog
                    isOpen={isAddProductDialogOpen}
                    onClose={() => setIsAddProductDialogOpen(false)}
                    onSubmit={addProductMutation.mutate}
                    isSubmitting={addProductMutation.isPending}
                  />
                </Dialog>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>R$ {product.price.toFixed(2).replace('.', ',')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitleComponent>Tem certeza?</AlertDialogTitleComponent>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o item{" "}
                                <span className="font-bold">{product.name}</span>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteProductMutation.mutate(product.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Nenhum produto ou serviço encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="stock" className="mt-4">
          <div className="p-4 border rounded-md bg-background shadow-md mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between flex-wrap gap-4">
              <CategoryFilter selectedCategory={selectedStockCategory} onSelectCategory={handleSelectStockCategory} options={stockCategoryOptions} />
              <div className="flex items-center space-x-2 w-full md:w-auto flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar itens no estoque..."
                    className="pl-9 border border-input rounded-lg"
                    value={stockSearchTerm}
                    onChange={(e) => setStockSearchTerm(e.target.value)}
                  />
                </div>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                </Button>
              </div>
            </div>
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
                    const IconComponent = stockCategoryIconMap[item.category] || Package;
                    return (
                      <TableRow key={item.id} onClick={() => handleStockRowClick(item)} className="cursor-pointer hover:bg-muted/50">
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
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      {productToEdit && (
        <Dialog open={isEditProductDialogOpen} onOpenChange={setIsEditProductDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Item</DialogTitle>
            </DialogHeader>
            <AddProductDialog
              isOpen={isEditProductDialogOpen}
              onClose={() => setIsEditProductDialogOpen(false)}
              onSubmit={(data) => updateProductMutation.mutate({ ...data, id: productToEdit.id, user_id: userId!, name: data.name, price: data.price, category: data.category })}
              isSubmitting={updateProductMutation.isPending}
              initialData={productToEdit}
            />
          </DialogContent>
        </Dialog>
      )}

      <StockItemDetailsDialog
        item={selectedStockItem}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
      />
    </div>
  );
};

export default Products;