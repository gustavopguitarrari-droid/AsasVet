"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { usePageTitle } from "@/context/PageTitleContext";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, DollarSign, PawPrint, ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimalDebit } from "@/types/cashier";

interface DebitDetails extends AnimalDebit {
  pet_name: string;
  client_name: string;
}

const ContasAReceber = () => {
  const { setPageTitle } = usePageTitle();
  const { user: appUser } = useUser();
  const organizationId = appUser?.organizationId;

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setPageTitle("Financeiro - Contas a Receber");
    return () => setPageTitle("");
  }, [setPageTitle]);

  const { data: debits = [], isLoading, error } = useQuery<DebitDetails[]>({
    queryKey: ['unpaidDebits', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('animal_debits')
        .select(`
          *,
          pets (
            name,
            clients (
              name
            )
          )
        `)
        .eq('organization_id', organizationId)
        .eq('is_paid', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Flatten the nested data
      return data.map(debit => ({
        ...debit,
        pet_name: debit.pets?.name || 'Animal Desconhecido',
        client_name: debit.pets?.clients?.name || 'Tutor Desconhecido',
      })) as DebitDetails[];
    },
    enabled: !!organizationId,
  });

  const filteredDebits = useMemo(() => {
    if (!searchTerm) return debits;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return debits.filter(debit =>
      debit.description.toLowerCase().includes(lowerCaseSearch) ||
      debit.pet_name.toLowerCase().includes(lowerCaseSearch) ||
      debit.client_name.toLowerCase().includes(lowerCaseSearch) ||
      debit.amount.toString().includes(lowerCaseSearch)
    );
  }, [debits, searchTerm]);

  const summary = useMemo(() => {
    const totalReceivable = debits.reduce((sum, debit) => sum + debit.amount, 0);
    const petsWithDebits = new Set(debits.map(debit => debit.pet_id)).size;
    return {
      totalReceivable,
      petsWithDebits,
    };
  }, [debits]);

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Carregando contas a receber...</div>;
  }

  if (error) {
    return <div className="text-center text-destructive">Erro ao carregar dados: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Contas a Receber</h2>
        <Button asChild variant="outline">
          <Link to="/financeiro">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground">
        Acompanhe todos os débitos de animais que estão pendentes de pagamento.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {summary.totalReceivable.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">Soma de todos os débitos pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Animais com Débitos</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.petsWithDebits}</div>
            <p className="text-xs text-muted-foreground">Total de animais com pagamentos pendentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por animal, tutor, descrição..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Animal</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead>Descrição do Débito</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDebits.length > 0 ? (
              filteredDebits.map((debit) => (
                <TableRow key={debit.id}>
                  <TableCell className="font-medium">{debit.pet_name}</TableCell>
                  <TableCell>{debit.client_name}</TableCell>
                  <TableCell>{debit.description}</TableCell>
                  <TableCell>{format(parseISO(debit.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell className="text-right font-bold text-destructive">R$ {debit.amount.toFixed(2).replace('.', ',')}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {searchTerm ? "Nenhum débito encontrado para sua busca." : "Nenhum débito pendente no momento."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ContasAReceber;