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
import { Search, TrendingDown, ArrowLeft, PlusCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddExpenseDialog, { ExpenseFormValues } from "@/components/AddExpenseDialog";
import { showError, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";

const Despesas = () => {
  const { setPageTitle } = usePageTitle();
  const { user: appUser } = useUser();
  const organizationId = appUser?.organizationId;
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    setPageTitle("Financeiro - Despesas");
    return () => setPageTitle("");
  }, [setPageTitle]);

  const { data: expenses = [], isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['expenses', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('type', 'Saída') // Fetch only expenses
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!organizationId,
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (newExpenseData: ExpenseFormValues) => {
      if (!appUser?.id || !organizationId) throw new Error("User or Organization ID not available.");
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: appUser.id,
          organization_id: organizationId,
          description: newExpenseData.description,
          type: 'Saída', // Hardcode type as 'Saída'
          amount: parseFloat(newExpenseData.amount.replace(',', '.')),
          date: format(newExpenseData.date, "yyyy-MM-dd"),
          time: newExpenseData.time,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', organizationId] }); // Invalidate general transactions too
      showSuccess("Despesa adicionada com sucesso!");
      setIsAddDialogOpen(false);
    },
    onError: (err: any) => {
      showError(`Erro ao adicionar despesa: ${err.message}`);
    },
  });

  const filteredExpenses = useMemo(() => {
    if (!searchTerm) return expenses;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return expenses.filter(tx =>
      tx.description.toLowerCase().includes(lowerCaseSearch) ||
      tx.amount.toString().replace('.', ',').includes(lowerCaseSearch)
    );
  }, [expenses, searchTerm]);

  const summary = useMemo(() => {
    const now = new Date();
    const thisMonthExpenses = expenses.filter(tx => isThisMonth(parseISO(tx.date)));
    
    const despesaTotal = expenses.reduce((sum, tx) => sum + tx.amount, 0);
    const despesaMes = thisMonthExpenses.reduce((sum, tx) => sum + tx.amount, 0);

    return {
      despesaTotal,
      despesaMes,
      countMes: thisMonthExpenses.length,
    };
  }, [expenses]);

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Carregando despesas...</div>;
  }

  if (error) {
    return <div className="text-center text-destructive">Erro ao carregar dados: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Controle de Despesas</h2>
        <Button asChild variant="outline">
          <Link to="/financeiro">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesa Total (Mês)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {summary.despesaMes.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">{summary.countMes} despesa(s) este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesa Geral</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {summary.despesaTotal.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">Soma de todas as despesas registradas</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar despesas..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Despesa</DialogTitle>
            </DialogHeader>
            <AddExpenseDialog
              onSubmit={addExpenseMutation.mutate}
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
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{format(parseISO(`${tx.date}T${tx.time}`), "dd/MM/yy HH:mm", { locale: ptBR })}</TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    - R$ {tx.amount.toFixed(2).replace('.', ',')}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">Nenhuma despesa encontrada.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Despesas;