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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { Transaction } from "@/types/cashier"; // Importar Transaction
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import AddTransactionDialog, { TransactionFormValues } from "@/components/AddTransactionDialog"; // Importar o diálogo
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { showError, showSuccess } from "@/utils/toast";

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

  // Função para lidar com a submissão do formulário de adição de transação
  const handleAddTransaction = (data: TransactionFormValues) => {
    addTransactionMutation.mutate(data);
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

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
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