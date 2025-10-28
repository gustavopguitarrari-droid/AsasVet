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
import { PlusCircle, Search, DollarSign, ShoppingCart, History, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format, isToday, parseISO } from "date-fns";

import ProductSelector from "@/components/cashier/ProductSelector";
import SalePanel from "@/components/cashier/SalePanel";
import AddProductDialog, { AddProductFormValues } from "@/components/cashier/AddProductDialog"; // Importar o novo diálogo
import { Product, SaleItem, Transaction } from "@/types/cashier";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";

const Caixa = () => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;

  const [currentSaleItems, setCurrentSaleItems] = React.useState<SaleItem[]>([]);
  const [activeTab, setActiveTab] = React.useState<string>("nova-venda");
  const [historySearchTerm, setHistorySearchTerm] = React.useState<string>("");
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = React.useState(false);

  // --- Queries ---
  const { data: products = [], isLoading: isLoadingProducts, error: productsError } = useQuery<Product[]>({
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

  const { data: transactions = [], isLoading: isLoadingTransactions, error: transactionsError } = useQuery<Transaction[]>({
    queryKey: ['transactions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          sale_items (
            id, product_id, name, price, quantity, total
          )
        `)
        .eq('user_id', userId);
      if (error) throw error;
      return data.map(dbTransaction => ({
        id: dbTransaction.id,
        description: dbTransaction.description,
        type: dbTransaction.type as "Entrada" | "Saída",
        amount: dbTransaction.amount,
        date: dbTransaction.date,
        time: dbTransaction.time,
        items: dbTransaction.sale_items || [],
        paymentMethod: dbTransaction.payment_method || undefined,
      })) as Transaction[];
    },
    enabled: !!userId,
  });

  // --- Mutations ---
  const addProductMutation = useMutation({
    mutationFn: async (newProductData: AddProductFormValues) => {
      if (!userId) throw new Error("User not authenticated.");
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
      showSuccess("Item adicionado ao catálogo com sucesso!");
      setIsAddProductDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao adicionar item: ${err.message}`);
    },
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (newTransaction: { transaction: Omit<Transaction, 'id' | 'created_at' | 'items'>; items: SaleItem[] }) => {
      if (!userId) throw new Error("User not authenticated.");

      const { data: insertedTransaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          description: newTransaction.transaction.description,
          type: newTransaction.transaction.type,
          amount: newTransaction.transaction.amount,
          date: newTransaction.transaction.date,
          time: newTransaction.transaction.time,
          payment_method: newTransaction.transaction.paymentMethod,
        })
        .select('id')
        .single();

      if (transactionError || !insertedTransaction) {
        throw transactionError || new Error("Failed to create transaction.");
      }

      if (newTransaction.items.length > 0) {
        const saleItemsPayload = newTransaction.items.map(item => ({
          transaction_id: insertedTransaction.id,
          product_id: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.total,
        }));
        const { error: saleItemsError } = await supabase
          .from('sale_items')
          .insert(saleItemsPayload);
        if (saleItemsError) {
          // Optionally, roll back the transaction if sale items fail
          await supabase.from('transactions').delete().eq('id', insertedTransaction.id);
          throw saleItemsError;
        }
      }
      return insertedTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      showSuccess("Venda finalizada com sucesso!");
      setCurrentSaleItems([]); // Clear the cart
      setActiveTab("historico"); // Optionally switch to history tab
    },
    onError: (err) => {
      showError(`Erro ao finalizar venda: ${err.message}`);
    },
  });

  const handleAddItemToSale = (product: Product, quantity: number) => {
    setCurrentSaleItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * product.price }
            : item
        );
      } else {
        return [...prevItems, { productId: product.id, name: product.name, price: product.price, quantity, total: quantity * product.price }];
      }
    });
  };

  const handleUpdateItemQuantity = (productId: string, newQuantity: number) => {
    setCurrentSaleItems((prevItems) => {
      if (newQuantity <= 0) {
        return prevItems.filter((item) => item.productId !== productId);
      }
      return prevItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      );
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCurrentSaleItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  const handleFinalizeSale = (paymentMethod: string) => {
    if (currentSaleItems.length === 0) {
      showError("Adicione itens à venda antes de finalizar.");
      return;
    }

    const totalAmount = currentSaleItems.reduce((sum, item) => sum + item.total, 0);
    const newTransaction: Omit<Transaction, 'id' | 'created_at' | 'items'> = {
      description: `Venda de ${currentSaleItems.length} item(s)`,
      type: "Entrada",
      amount: totalAmount,
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
      paymentMethod,
    };

    addTransactionMutation.mutate({ transaction: newTransaction, items: currentSaleItems });
  };

  const handleCancelSale = () => {
    setCurrentSaleItems([]);
    showSuccess("Venda cancelada.");
  };

  const totalSaleAmount = currentSaleItems.reduce((sum, item) => sum + item.total, 0);

  // Cálculos para os cards de resumo (agora baseados em todas as transações)
  const today = format(new Date(), "yyyy-MM-dd");
  const transactionsToday = transactions.filter(t => t.date === today);

  const totalBalance = transactions.reduce((sum, t) => {
    return t.type === "Entrada" ? sum + t.amount : sum - t.amount;
  }, 0);

  const entriesToday = transactionsToday
    .filter(t => t.type === "Entrada")
    .reduce((sum, t) => sum + t.amount, 0);

  const exitsToday = transactionsToday
    .filter(t => t.type === "Saída")
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredHistoryTransactions = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
    transaction.type.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
    transaction.amount.toFixed(2).includes(historySearchTerm) ||
    transaction.date.includes(historySearchTerm) ||
    transaction.time.includes(historySearchTerm) ||
    (transaction.items && transaction.items.some(item => item.name.toLowerCase().includes(historySearchTerm.toLowerCase())))
  );

  if (isLoadingProducts || isLoadingTransactions) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando dados do caixa...</p>
      </div>
    );
  }

  if (productsError || transactionsError) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Erro ao carregar dados: {productsError?.message || transactionsError?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className={cn("text-white shadow-md", totalBalance >= 0 ? "bg-green-700" : "bg-red-700")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Lucro bruto Diário</CardTitle>
            <DollarSign className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">R$ {totalBalance.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-white/80">Total de entradas menos saídas do dia</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Entradas Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">R$ {entriesToday.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">{transactionsToday.filter(t => t.type === "Entrada").length} transações</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs font-medium">Saídas Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="text-xl font-bold">R$ {exitsToday.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">{transactionsToday.filter(t => t.type === "Saída").length} transações</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="nova-venda" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">
            <ShoppingCart className="h-5 w-5 mr-2" /> Nova Venda
          </TabsTrigger>
          <TabsTrigger value="historico" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">
            <History className="h-5 w-5 mr-2" /> Histórico de Transações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nova-venda" className="mt-4">
          <div className="flex justify-end mb-4">
            <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
              <DialogTrigger asChild>
                <Button className="font-bold">
                  <Package className="mr-2 h-4 w-4" /> Adicionar Produto/Serviço
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductSelector
              onAddProduct={handleAddItemToSale}
              products={products}
              isLoadingProducts={isLoadingProducts}
            />
            <SalePanel
              items={currentSaleItems}
              onUpdateQuantity={handleUpdateItemQuantity}
              onRemoveItem={handleRemoveItem}
              totalAmount={totalSaleAmount}
              onFinalizeSale={handleFinalizeSale}
              onCancelSale={handleCancelSale}
              hasItemsInCart={currentSaleItems.length > 0}
            />
          </div>
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar transações no histórico..."
                className="pl-9"
                value={historySearchTerm}
                onChange={(e) => setHistorySearchTerm(e.target.value)}
              />
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
                  <TableHead>Hora</TableHead>
                  <TableHead>Método Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistoryTransactions.length > 0 ? (
                  filteredHistoryTransactions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>
                        {item.description}
                        {item.items && item.items.length > 0 && (
                          <ul className="text-xs text-muted-foreground mt-1 list-disc pl-4">
                            {item.items.map(saleItem => (
                              <li key={saleItem.productId}>{saleItem.name} ({saleItem.quantity}x)</li>
                            ))}
                          </ul>
                        )}
                      </TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>R$ {item.amount.toFixed(2).replace('.', ',')}</TableCell>
                      <TableCell>{format(parseISO(item.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{item.time}</TableCell>
                      <TableCell>{item.paymentMethod || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Nenhuma transação encontrada no histórico.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Caixa;