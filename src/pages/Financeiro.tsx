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
import { PlusCircle, Search, History, Trash2, AlertCircle } from "lucide-react"; // Adicionado History, Trash2, AlertCircle
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { Transaction } from "@/types/cashier"; // Importar Transaction
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import AddTransactionDialog, { TransactionFormValues } from "@/components/AddTransactionDialog"; // Importar o diálogo
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog"; // Importar AlertDialog

const Financeiro = () => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id; // Current user's ID
  const organizationId = appUser?.organizationId; // Current user's organization ID

  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = React.useState(false);

  // Query para buscar transações
  const { data: transactions = [], isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['transactions', userId, organizationId], // Adicionado organizationId ao queryKey
    queryFn: async () => {
      if (!userId || !organizationId) return []; // Habilitar query apenas se organizationId estiver disponível
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        // .eq('user_id', userId) // REMOVIDO: A política de RLS já filtra por organization_id
        .eq('organization_id', organizationId) // Filtrar por organization_id
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!userId && !!organizationId, // Habilitar query apenas se userId E organizationId estiverem disponíveis
  });

  // Mutação para adicionar uma nova transação
  const addTransactionMutation = useMutation({
    mutationFn: async (newTransactionData: TransactionFormValues) => {
      if (!userId || !organizationId) { // Ensure both userId and organizationId are available
        throw new Error("User or Organization ID not available.");
      }
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId, // Add user_id
          organization_id: organizationId, // Add organization_id
          description: newTransactionData.description,
          type: newTransactionData.type,
          amount: parseFloat(newTransactionData.amount),
          date: format(newTransactionData.date, "yyyy-MM-dd"),
          time: newTransactionData.time,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId, organizationId] }); // Invalida com organizationId
      showSuccess("Transação adicionada com sucesso!");
      setIsAddTransactionDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao adicionar transação: ${err.message}`);
    },
  });

  // NOVO: Mutação para limpar o histórico de transações
  const clearTransactionsHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !organizationId) throw new Error("User not authenticated or organization ID not available.");

      // Primeiro, buscar todos os IDs de transações para a organização
      const { data: transactionIds, error: fetchError } = await supabase
        .from('transactions')
        .select('id')
        .eq('organization_id', organizationId);

      if (fetchError) {
        console.error("Erro ao buscar IDs de transações para exclusão:", fetchError);
        throw fetchError;
      }

      const idsToDelete = transactionIds.map(t => t.id);

      if (idsToDelete.length > 0) {
        // Excluir sale_items associados a essas transações
        const { error: deleteSaleItemsError } = await supabase
          .from('sale_items')
          .delete()
          .in('transaction_id', idsToDelete)
          .eq('organization_id', organizationId);

        if (deleteSaleItemsError) {
          console.error("Erro ao excluir sale_items:", deleteSaleItemsError);
          throw deleteSaleItemsError;
        }

        // Excluir animal_debits associados a essas transações
        const { error: deleteAnimalDebitsError } = await supabase
          .from('animal_debits')
          .update({ is_paid: false, transaction_id: null }) // Resetar status e desvincular
          .in('transaction_id', idsToDelete)
          .eq('organization_id', organizationId);

        if (deleteAnimalDebitsError) {
          console.error("Erro ao desvincular animal_debits:", deleteAnimalDebitsError);
          throw deleteAnimalDebitsError;
        }

        // Finalmente, excluir as transações
        const { error: deleteTransactionsError } = await supabase
          .from('transactions')
          .delete()
          .in('id', idsToDelete)
          .eq('organization_id', organizationId);

        if (deleteTransactionsError) {
          console.error("Erro ao excluir transações:", deleteTransactionsError);
          throw deleteTransactionsError;
        }
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId, organizationId] });
      queryClient.invalidateQueries({ queryKey: ['products', userId, organizationId] }); // Invalida produtos para garantir consistência
      queryClient.invalidateQueries({ queryKey: ['animalDebits', userId, organizationId] }); // Invalida débitos de animais
      showSuccess("Histórico de transações limpo com sucesso!");
    },
    onError: (err) => {
      showError(`Erro ao limpar histórico de transações: ${err.message}`);
    },
  });

  // Função para lidar com a submissão do formulário de adição de transação
  const handleAddTransaction = (data: TransactionFormValues) => {
    addTransactionMutation.mutate(data);
  };

  // NOVO: Handler para limpar o histórico de transações
  const handleClearHistory = () => {
    clearTransactionsHistoryMutation.mutate();
  };

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.amount.toFixed(2).includes(searchTerm) ||
    format(parseISO(transaction.date), "dd/MM/yyyy", { locale: ptBR }).includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando transações...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Erro ao carregar transações: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Financeiro</h2>
        <div className="flex space-x-2"> {/* Contêiner para os botões */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={transactions.length === 0 || clearTransactionsHistoryMutation.isPending}>
                <Trash2 className="mr-2 h-4 w-4" />
                {clearTransactionsHistoryMutation.isPending ? "Limpando..." : "Limpar Histórico"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitleComponent className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-destructive" /> Confirmar Limpeza do Histórico
                </AlertDialogTitleComponent>
                <AlertDialogDescription>
                  Tem certeza que deseja limpar TODO o histórico de transações?
                  Esta ação não pode ser desfeita e removerá permanentemente todos os registros de vendas e débitos vinculados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={clearTransactionsHistoryMutation.isPending}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearHistory} disabled={clearTransactionsHistoryMutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {clearTransactionsHistoryMutation.isPending ? "Limpando..." : "Sim, Limpar Tudo"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog open={isAddTransactionDialogOpen} onOpenChange={setIsAddTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Transação</DialogTitle>
              </DialogHeader>
              <AddTransactionDialog onSubmit={handleAddTransaction} onCancel={() => setIsAddTransactionDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            className="pl-9 border border-input rounded-lg"
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
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>R$ {item.amount.toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell>{format(parseISO(item.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell>{item.time}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Financeiro;