"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { usePageTitle } from "@/context/PageTitleContext";
import { format, parseISO, isThisMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transaction } from "@/types/cashier";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, DollarSign, TrendingUp, TrendingDown, ArrowLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddTransactionDialog, { TransactionFormValues } from "@/components/AddTransactionDialog";
import { showError, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";

const FluxoDeCaixa = () => {
  const { setPageTitle } = usePageTitle();
  const { user: appUser } = useUser();
  const organizationId = appUser?.organizationId;
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    setPageTitle("Financeiro - Fluxo de Caixa");
    return () => setPageTitle("");
  }, [setPageTitle]);

  const { data: transactions = [], isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['transactions', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!organizationId,
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (newTransactionData: TransactionFormValues) => {
      if (!appUser?.id || !organizationId) throw new Error("User or Organization ID not available.");
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: appUser.id,
          organization_id: organizationId,
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
      queryClient.invalidateQueries({ queryKey: ['transactions', organizationId] });
      showSuccess("Transação adicionada com sucesso!");
      setIsAddDialogOpen(false);
    },
    onError: (err: any) => {
      showError(`Erro ao adicionar transação: ${err.message}`);
    },
  });

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return transactions.filter(tx =>
      tx.description.toLowerCase().includes(lowerCaseSearch) ||
      tx.type.toLowerCase().includes(lowerCaseSearch) ||
      tx.amount.toString().replace('.', ',').includes(lowerCaseSearch)
    );
  }, [transactions, searchTerm]);

  const summary = useMemo(() => {
    const now = new Date();
    const thisMonthTransactions = transactions.filter(tx => isThisMonth(parseISO(tx.date)));
    
    const receitaTotal = transactions.reduce((sum, tx) => tx.type === 'Entrada' ? sum + tx.amount : sum, 0);
    const despesaTotal = transactions.reduce((sum, tx) => tx.type === 'Saída' ? sum + tx.amount : sum, 0);
    
    const receitaMes = thisMonthTransactions.reduce((sum, tx) => tx.type === 'Entrada' ? sum + tx.amount : sum, 0);
    const despesaMes = thisMonthTransactions.reduce((sum, tx) => tx.type === 'Saída' ? sum + tx.amount : sum, 0);

    return {
      saldoAtual: receitaTotal - despesaTotal,
      receitaMes,
      despesaMes,
    };
  }, [transactions]);

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Carregando fluxo de caixa...</div>;
  }

  if (error) {
    return <div className="text-center text-destructive">Erro ao carregar dados: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Fluxo de Caixa</h2>
        <Button asChild variant="outline">
          <Link to="/financeiro">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", summary.saldoAtual >= 0 ? "text-green-600" : "text-red-600")}>
              R$ {summary.saldoAtual.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-muted-foreground">Balanço total de entradas e saídas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total (Mês)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {summary.receitaMes.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">Total de entradas no mês atual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesa Total (Mês)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {summary.despesaMes.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">Total de saídas no mês atual</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Transação</DialogTitle>
            </DialogHeader>
            <AddTransactionDialog
              onSubmit={addTransactionMutation.mutate}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{format(parseISO(`${tx.date}T${tx.time}`), "dd/MM/yy HH:mm", { locale: ptBR })}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell>
                    <Badge variant={tx.type === 'Entrada' ? 'default' : 'destructive'} className={cn(tx.type === 'Entrada' && 'bg-green-600')}>
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn("text-right font-medium", tx.type === 'Entrada' ? 'text-green-600' : 'text-red-600')}>
                    {tx.type === 'Saída' && '- '}R$ {tx.amount.toFixed(2).replace('.', ',')}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Nenhuma transação encontrada.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FluxoDeCaixa;