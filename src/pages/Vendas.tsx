"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { usePageTitle } from "@/context/PageTitleContext";
import { format, parseISO, isToday, isThisMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Transaction, SaleItem } from "@/types/cashier";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, DollarSign, Calendar, ShoppingCart, List } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Estende a interface Transaction para garantir que sale_items esteja sempre presente
interface SaleTransaction extends Transaction {
  sale_items: SaleItem[];
}

const Vendas = () => {
  const { setPageTitle } = usePageTitle();
  const { user: appUser } = useUser();
  const organizationId = appUser?.organizationId;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState<SaleTransaction | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  useEffect(() => {
    setPageTitle("Financeiro - Vendas");
    return () => setPageTitle("");
  }, [setPageTitle]);

  const { data: sales = [], isLoading, error } = useQuery<SaleTransaction[]>({
    queryKey: ['sales', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('transactions')
        .select('*, sale_items(*)')
        .eq('organization_id', organizationId)
        .eq('type', 'Entrada')
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) throw error;
      return data as SaleTransaction[];
    },
    enabled: !!organizationId,
  });

  const filteredSales = useMemo(() => {
    if (!searchTerm) return sales;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return sales.filter(sale =>
      sale.description.toLowerCase().includes(lowerCaseSearch) ||
      (sale.payment_method && sale.payment_method.toLowerCase().includes(lowerCaseSearch)) ||
      sale.amount.toString().includes(lowerCaseSearch) ||
      sale.sale_items.some(item => item.name.toLowerCase().includes(lowerCaseSearch))
    );
  }, [sales, searchTerm]);

  const summary = useMemo(() => {
    const now = new Date();
    const todaySales = sales.filter(sale => isToday(parseISO(sale.date)));
    const thisMonthSales = sales.filter(sale => isThisMonth(parseISO(sale.date)));

    return {
      todayRevenue: todaySales.reduce((sum, sale) => sum + sale.amount, 0),
      todayCount: todaySales.length,
      monthRevenue: thisMonthSales.reduce((sum, sale) => sum + sale.amount, 0),
      monthCount: thisMonthSales.length,
    };
  }, [sales]);

  const handleRowClick = (sale: SaleTransaction) => {
    setSelectedSale(sale);
    setIsDetailsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="text-center text-muted-foreground">Carregando histórico de vendas...</div>;
  }

  if (error) {
    return <div className="text-center text-destructive">Erro ao carregar vendas: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Histórico de Vendas</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {summary.todayRevenue.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">{summary.todayCount} venda(s) hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento no Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {summary.monthRevenue.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">{summary.monthCount} venda(s) este mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar vendas por descrição, item, valor..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <TableRow key={sale.id} onClick={() => handleRowClick(sale)} className="cursor-pointer">
                  <TableCell>{format(parseISO(`${sale.date}T${sale.time}`), "dd/MM/yy HH:mm", { locale: ptBR })}</TableCell>
                  <TableCell>{sale.description}</TableCell>
                  <TableCell>{sale.sale_items.length} item(s)</TableCell>
                  <TableCell>
                    <Badge variant="outline">{sale.payment_method || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">R$ {sale.amount.toFixed(2).replace('.', ',')}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Nenhuma venda encontrada.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda</DialogTitle>
            <DialogDescription>
              Venda realizada em {selectedSale && format(parseISO(`${selectedSale.date}T${selectedSale.time}`), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="font-medium">ID da Transação: <span className="font-normal text-muted-foreground">{selectedSale.id}</span></div>
              <ScrollArea className="h-48 rounded-md border p-2">
                <h4 className="mb-2 font-semibold flex items-center"><List className="h-4 w-4 mr-2"/> Itens Vendidos</h4>
                <ul className="space-y-1 text-sm">
                  {selectedSale.sale_items.map(item => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                      <span>R$ {item.total.toFixed(2).replace('.', ',')}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="font-semibold">Método de Pagamento:</span>
                <Badge variant="secondary">{selectedSale.payment_method}</Badge>
              </div>
              <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>R$ {selectedSale.amount.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vendas;