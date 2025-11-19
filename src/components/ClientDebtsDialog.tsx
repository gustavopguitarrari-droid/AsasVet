"use client";

import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, ListChecks, PawPrint } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/cadastro";
import { AnimalDebit } from "@/types/cashier";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DebtWithPetName extends AnimalDebit {
  pets: {
    name: string;
  } | null;
}

interface ClientDebtsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

const ClientDebtsDialog: React.FC<ClientDebtsDialogProps> = ({ isOpen, onClose, client }) => {
  const { data: debts = [], isLoading, error } = useQuery<DebtWithPetName[]>({
    queryKey: ['clientDebts', client?.id],
    queryFn: async () => {
      if (!client?.id) return [];

      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('id')
        .eq('owner_id', client.id);

      if (petsError) throw petsError;
      const petIds = petsData.map(p => p.id);
      if (petIds.length === 0) return [];

      const { data: debtsData, error: debtsError } = await supabase
        .from('animal_debits')
        .select('*, pets(name)')
        .in('pet_id', petIds)
        .eq('is_paid', false)
        .order('created_at', { ascending: false });

      if (debtsError) throw debtsError;
      return debtsData as DebtWithPetName[];
    },
    enabled: !!client?.id,
  });

  const summary = useMemo(() => {
    const totalOwed = debts.reduce((sum, debt) => sum + debt.amount, 0);
    return {
      totalOwed,
      totalDebts: debts.length,
    };
  }, [debts]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="h-6 w-6 mr-2 text-primary" />
            Débitos Pendentes de {client?.name}
          </DialogTitle>
          <DialogDescription>
            Visualize todos os valores pendentes dos animais deste tutor.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2 my-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total Pendente</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                R$ {summary.totalOwed.toFixed(2).replace('.', ',')}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Débitos Registrados</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalDebts}</div>
            </CardContent>
          </Card>
        </div>

        <ScrollArea className="flex-1 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">Carregando débitos...</TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center text-destructive">Erro ao carregar débitos.</TableCell></TableRow>
              ) : debts.length > 0 ? (
                debts.map((debt) => (
                  <TableRow key={debt.id}>
                    <TableCell className="font-medium flex items-center">
                      <PawPrint className="h-4 w-4 mr-2 text-muted-foreground" />
                      {debt.pets?.name || 'Animal não encontrado'}
                    </TableCell>
                    <TableCell>{debt.description}</TableCell>
                    <TableCell>{format(parseISO(debt.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell className="text-right font-medium text-destructive">R$ {debt.amount.toFixed(2).replace('.', ',')}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Nenhum débito pendente para este tutor.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDebtsDialog;