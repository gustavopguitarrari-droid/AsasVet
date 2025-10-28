"use client";

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
import { PlusCircle, Search, DollarSign, ShoppingCart, History, Package, X, User, PawPrint } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter as OriginalDialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format, isToday, parseISO } from "date-fns";

import ProductSelector from "@/components/cashier/ProductSelector";
import SalePanel from "@/components/cashier/SalePanel";
import AddProductDialog, { AddProductFormValues } from "@/components/cashier/AddProductDialog";
import { Product, SaleItem, Transaction } from "@/types/cashier";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { Client, Pet } from "@/types/cadastro"; // Importar Client e Pet

// NOVO: Interface para AnimalDebit
interface AnimalDebit {
  id: string;
  pet_id: string;
  description: string;
  amount: number;
  is_paid: boolean;
  transaction_id: string | null;
  created_at: string;
  pet_name?: string; // Adicionado para exibição
}

interface CashierDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CashierDialog: React.FC<CashierDialogProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;

  const [currentSaleItems, setCurrentSaleItems] = React.useState<SaleItem[]>([]);
  const [activeTab, setActiveTab] = React.useState<string>("nova-venda");
  const [historySearchTerm, setHistorySearchTerm] = React.useState<string>("");
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = React.useState(false);

  // NOVO: Estados para busca de CPF e débitos
  const [cpfInput, setCpfInput] = React.useState<string>("");
  const [foundClient, setFoundClient] = React.useState<Client | null>(null);
  const [unpaidDebits, setUnpaidDebits] = React.useState<AnimalDebit[]>([]);

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

  // NOVO: Query para buscar clientes
  const { data: clients = [], isLoading: isLoadingClients, error: clientsError } = useQuery<Client[]>({
    queryKey: ['cashierClients', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data.map(dbClient => ({
        id: dbClient.id,
        name: dbClient.name,
        email: dbClient.email,
        phone: dbClient.phone,
        cpf: dbClient.cpf,
        dateOfBirth: dbClient.date_of_birth,
        address: {
          cep: dbClient.address_cep || '',
          street: dbClient.address_street || '',
          number: dbClient.address_number || '',
          complement: dbClient.address_complement || undefined,
          neighborhood: dbClient.address_neighborhood || '',
          city: dbClient.address_city || '',
          state: dbClient.address_state || '',
        },
        observations: dbClient.observations || undefined,
        photoUrl: dbClient.photo_url || undefined,
      }));
    },
    enabled: !!userId,
  });

  // NOVO: Query para buscar pets
  const { data: pets = [], isLoading: isLoadingPets, error: petsError } = useQuery<Pet[]>({
    queryKey: ['cashierPets', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('pets')
        .select('*');
      if (error) throw error;
      return data.map(dbPet => ({
        id: dbPet.id,
        name: dbPet.name,
        species: dbPet.species,
        breed: dbPet.breed,
        age: dbPet.age,
        gender: dbPet.gender,
        color: dbPet.color,
        weight: dbPet.weight || undefined,
        observations: dbPet.observations || undefined,
        photoUrl: dbPet.photo_url || undefined,
        ownerId: dbPet.owner_id,
      }));
    },
    enabled: !!userId,
  });

  // NOVO: Query para buscar débitos de animais
  const { data: animalDebits = [], isLoading: isLoadingAnimalDebits, error: animalDebitsError, refetch: refetchAnimalDebits } = useQuery<AnimalDebit[]>({
    queryKey: ['animalDebits', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('animal_debits')
        .select('*')
        .eq('user_id', userId)
        .eq('is_paid', false); // Apenas débitos não pagos
      if (error) throw error;
      return data as AnimalDebit[];
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

        // NOVO: Atualizar débitos de animais como pagos
        const debitIdsToUpdate = newTransaction.items
          .filter(item => item.debitId)
          .map(item => item.debitId);

        if (debitIdsToUpdate.length > 0) {
          const { error: updateDebitsError } = await supabase
            .from('animal_debits')
            .update({ is_paid: true, transaction_id: insertedTransaction.id })
            .in('id', debitIdsToUpdate)
            .eq('user_id', userId); // Garantir que apenas os débitos do usuário sejam atualizados
          if (updateDebitsError) {
            console.error("Erro ao atualizar débitos de animais:", updateDebitsError);
            // Não lançar erro fatal aqui, pois a transação principal já foi criada
          }
        }
      }
      return insertedTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['animalDebits', userId] }); // Invalidar débitos para refletir pagamentos
      showSuccess("Venda finalizada com sucesso!");
      setCurrentSaleItems([]); // Clear the cart
      setFoundClient(null); // Limpar cliente encontrado
      setUnpaidDebits([]); // Limpar débitos exibidos
      setCpfInput(""); // Limpar input de CPF
      setActiveTab("historico"); // Optionally switch to history tab
    },
    onError: (err) => {
      showError(`Erro ao finalizar venda: ${err.message}`);
    },
  });

  const handleAddItemToSale = (product: Product, quantity: number, debitId?: string) => {
    setCurrentSaleItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id && item.debitId === debitId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.id && item.debitId === debitId
            ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * product.price }
            : item
        );
      } else {
        return [...prevItems, { productId: product.id, name: product.name, price: product.price, quantity, total: quantity * product.price, debitId }];
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
    setFoundClient(null);
    setUnpaidDebits([]);
    setCpfInput("");
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

  // NOVO: Lógica de busca por CPF e carregamento de débitos
  const handleSearchCpf = async () => {
    if (!userId) {
      showError("Usuário não autenticado.");
      return;
    }
    const cleanCpf = cpfInput.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      showError("CPF inválido. Digite 11 dígitos.");
      setFoundClient(null);
      setUnpaidDebits([]);
      return;
    }

    const client = clients.find(c => c.cpf.replace(/\D/g, '') === cleanCpf);

    if (client) {
      setFoundClient(client);
      showSuccess(`Tutor ${client.name} encontrado!`);

      const clientPets = pets.filter(p => p.ownerId === client.id);
      const clientPetIds = clientPets.map(p => p.id);

      // Filtrar débitos em aberto para os pets encontrados
      const debitsForClientPets = animalDebits
        .filter(debit => clientPetIds.includes(debit.pet_id))
        .map(debit => ({
          ...debit,
          pet_name: clientPets.find(p => p.id === debit.pet_id)?.name || "Animal Desconhecido"
        }));
      setUnpaidDebits(debitsForClientPets);
    } else {
      showError("Tutor não encontrado com este CPF.");
      setFoundClient(null);
      setUnpaidDebits([]);
    }
  };

  const handleAddDebitToSale = (debit: AnimalDebit) => {
    // Verificar se o débito já está no carrinho
    const alreadyInCart = currentSaleItems.some(item => item.debitId === debit.id);
    if (alreadyInCart) {
      showError("Este débito já foi adicionado ao carrinho.");
      return;
    }

    const product: Product = {
      id: `debit-${debit.id}`, // ID único para o item de débito
      name: `${debit.description} (Animal: ${debit.pet_name})`,
      price: debit.amount,
      category: "Débito",
    };
    handleAddItemToSale(product, 1, debit.id); // Adicionar com quantity 1 e o debitId
    showSuccess(`Débito de ${debit.description} adicionado à venda.`);
  };

  if (isLoadingProducts || isLoadingTransactions || isLoadingClients || isLoadingPets || isLoadingAnimalDebits) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full md:w-[700px] lg:w-[900px] flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" /> Caixa
            </SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Carregando dados do caixa...</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (productsError || transactionsError || clientsError || petsError || animalDebitsError) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full md:w-[700px] lg:w-[900px] flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" /> Caixa
            </SheetTitle>
          </SheetHeader>
          <div className="flex items-center justify-center h-full text-destructive">
            <p>Erro ao carregar dados: {productsError?.message || transactionsError?.message || clientsError?.message || petsError?.message || animalDebitsError?.message}</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full md:w-[700px] lg:w-[900px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" /> Caixa
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-6 flex-1 overflow-y-auto p-4">
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

              {/* NOVO: Seção de Busca por CPF e Débitos em Aberto */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <User className="h-5 w-5 mr-2" /> Buscar Débitos por Tutor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="CPF do Tutor (somente números)"
                      value={cpfInput}
                      onChange={(e) => setCpfInput(e.target.value.replace(/\D/g, ''))}
                      maxLength={11}
                      className="flex-1"
                    />
                    <Button onClick={handleSearchCpf} disabled={!cpfInput || cpfInput.length !== 11}>
                      <Search className="h-4 w-4 mr-2" /> Buscar
                    </Button>
                  </div>
                  {foundClient && (
                    <p className="text-sm text-muted-foreground">
                      Tutor encontrado: <span className="font-semibold">{foundClient.name}</span>
                    </p>
                  )}

                  {unpaidDebits.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" /> Débitos em Aberto
                      </h4>
                      <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                        {unpaidDebits.map(debit => (
                          <div key={debit.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                            <div>
                              <p className="font-medium">{debit.description}</p>
                              <p className="text-sm text-muted-foreground">
                                <PawPrint className="h-3 w-3 inline-block mr-1" /> {debit.pet_name} - R$ {debit.amount.toFixed(2).replace('.', ',')}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleAddDebitToSale(debit)}
                              disabled={currentSaleItems.some(item => item.debitId === debit.id)}
                            >
                              <PlusCircle className="h-4 w-4 mr-2" /> Adicionar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

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
        <SheetFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" /> Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CashierDialog;