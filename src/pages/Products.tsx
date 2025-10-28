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
import { PlusCircle, Search, Package, Tag, Edit, Trash2, ListFilter, DollarSign } from "lucide-react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { usePageTitle } from "@/context/PageTitleContext";

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

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | undefined>(undefined);

  useEffect(() => {
    setPageTitle("Produtos e Serviços");
    return () => setPageTitle("");
  }, [setPageTitle]);

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['products', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!userId,
  });

  const addProductMutation = useMutation({
    mutationFn: async (newProductData: AddProductFormValues) => {
      if (!userId) {
        throw new Error("User ID not available.");
      }
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: userId,
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
      queryClient.invalidateQueries({ queryKey: ['products', userId] });
      showSuccess("Produto/Serviço adicionado com sucesso!");
      setIsAddProductDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao adicionar item: ${err.message}`);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (updatedProductData: Product) => {
      if (!userId) {
        throw new Error("User ID not available.");
      }
      const { data, error } = await supabase
        .from('products')
        .update({
          name: updatedProductData.name,
          price: updatedProductData.price,
          category: updatedProductData.category,
        })
        .eq('id', updatedProductData.id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', userId] });
      showSuccess("Produto/Serviço atualizado com sucesso!");
      setIsEditProductDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao atualizar item: ${err.message}`);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!userId) {
        throw new Error("User ID not available.");
      }
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', userId);
      if (error) throw error;
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', userId] });
      showSuccess("Produto/Serviço excluído com sucesso!");
    },
    onError: (err) => {
      showError(`Erro ao excluir item: ${err.message}`);
    },
  });

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.price.toFixed(2).includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsEditProductDialogOpen(true);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o item "${productName}"? Esta ação não pode ser desfeita.`)) {
      deleteProductMutation.mutate(productId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando produtos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Erro ao carregar produtos: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Novo contêiner flexível para filtros, busca e botão */}
      <div className="flex flex-col md:flex-row items-center justify-between flex-wrap gap-4">
        <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={handleSelectCategory} options={productCategoryOptions} />
        <div className="flex items-center space-x-2 w-full md:w-auto flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos ou serviços..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
    </div>
  );
};

export default Products;