"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { usePageTitle } from "@/context/PageTitleContext";
import { format, subDays, startOfDay, endOfDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, PawPrint, Users, CalendarCheck, Printer } from "lucide-react";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Transaction } from "@/types/cashier";
import { Appointment } from "@/pages/Appointments";
import { Client, Pet } from "@/types/cadastro";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { generateFinancialReportPdf } from "@/utils/generateFinancialReportPdf";
import { showError, showSuccess } from "@/utils/toast";
import PdfPreviewDialog from "@/components/PdfPreviewDialog";

const Reports = () => {
  const { setPageTitle } = usePageTitle();
  const { user: appUser } = useUser();
  const organizationId = appUser?.organizationId;

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFilename, setPdfFilename] = useState("");

  useEffect(() => {
    setPageTitle("Financeiro - Relatórios");
    return () => setPageTitle("");
  }, [setPageTitle]);

  const { data: reportData, isLoading, error } = useQuery({
    queryKey: ['reports', organizationId, dateRange],
    queryFn: async () => {
      if (!organizationId || !dateRange?.from || !dateRange?.to) return null;

      const fromDate = format(startOfDay(dateRange.from), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      const toDate = format(endOfDay(dateRange.to), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

      const [transactionsRes, appointmentsRes, clientsRes, petsRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('organization_id', organizationId).gte('created_at', fromDate).lte('created_at', toDate),
        supabase.from('appointments').select('*').eq('organization_id', organizationId).gte('created_at', fromDate).lte('created_at', toDate),
        supabase.from('clients').select('id').eq('organization_id', organizationId).gte('created_at', fromDate).lte('created_at', toDate),
        supabase.from('pets').select('id').eq('organization_id', organizationId).gte('created_at', fromDate).lte('created_at', toDate),
      ]);

      if (transactionsRes.error) throw transactionsRes.error;
      if (appointmentsRes.error) throw appointmentsRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (petsRes.error) throw petsRes.error;

      return {
        transactions: transactionsRes.data as Transaction[],
        appointments: appointmentsRes.data as Appointment[],
        newClientsCount: clientsRes.data.length,
        newPetsCount: petsRes.data.length,
      };
    },
    enabled: !!organizationId && !!dateRange?.from && !!dateRange?.to,
  });

  const summary = useMemo(() => {
    if (!reportData) {
      return { revenue: 0, expenses: 0, profit: 0, completedAppointments: 0 };
    }
    const revenue = reportData.transactions.reduce((sum, tx) => tx.type === 'Entrada' ? sum + tx.amount : sum, 0);
    const expenses = reportData.transactions.reduce((sum, tx) => tx.type === 'Saída' ? sum + tx.amount : sum, 0);
    const completedAppointments = reportData.appointments.filter(app => app.status === 'Realizada').length;

    return {
      revenue,
      expenses,
      profit: revenue - expenses,
      completedAppointments,
    };
  }, [reportData]);

  const generateReportPdfMutation = useMutation({
    mutationFn: async () => {
      if (!reportData || !dateRange?.from || !dateRange?.to || !appUser) {
        throw new Error("Dados insuficientes para gerar o relatório.");
      }
      const blob = await generateFinancialReportPdf({
        transactions: reportData.transactions,
        summary,
        dateRange,
        logoUrl: appUser.logoUrl,
        clinicDetails: {
          companyName: appUser.companyName || "Sua Clínica",
          address: `${appUser.addressStreet || ''}, ${appUser.addressNumber || ''} - ${appUser.addressCity || ''}`,
          phone: appUser.phone || '',
          email: appUser.email || '',
        },
      });
      return blob;
    },
    onSuccess: (blob) => {
      setPdfBlob(blob);
      const from = format(dateRange!.from!, 'yyyy-MM-dd');
      const to = format(dateRange!.to!, 'yyyy-MM-dd');
      setPdfFilename(`Relatorio_Financeiro_${from}_a_${to}.pdf`);
      setIsPdfPreviewOpen(true);
    },
    onError: (err: any) => {
      showError(`Erro ao gerar PDF: ${err.message}`);
    },
  });

  const handlePrintReport = () => {
    generateReportPdfMutation.mutate();
  };

  const handleConfirmPdfDownload = (filename: string, downloadUrl: string) => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showSuccess("Relatório baixado com sucesso!");
    setIsPdfPreviewOpen(false);
  };

  if (error) {
    return <div className="text-center text-destructive">Erro ao carregar dados do relatório: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Relatórios</h2>
        <Button asChild variant="outline">
          <Link to="/financeiro">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-4">
          <label className="font-medium">Período do Relatório:</label>
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        </div>
        <Button onClick={handlePrintReport} disabled={isLoading || generateReportPdfMutation.isPending}>
          <Printer className="mr-2 h-4 w-4" />
          {generateReportPdfMutation.isPending ? "Gerando..." : "Imprimir Relatório"}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-10">Gerando relatório...</div>
      ) : reportData ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {summary.revenue.toFixed(2).replace('.', ',')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesa Total</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {summary.expenses.toFixed(2).replace('.', ',')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", summary.profit >= 0 ? "text-green-600" : "text-red-600")}>
                  R$ {summary.profit.toFixed(2).replace('.', ',')}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consultas Realizadas</CardTitle>
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.completedAppointments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Novos Tutores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.newClientsCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Novos Animais</CardTitle>
                <PawPrint className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.newPetsCount}</div>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-xl font-bold pt-4">Detalhes das Transações</h3>
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
                {reportData.transactions.length > 0 ? (
                  reportData.transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{format(parseISO(tx.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}</TableCell>
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
                    <TableCell colSpan={4} className="h-24 text-center">Nenhuma transação no período selecionado.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      ) : null}

      <PdfPreviewDialog
        isOpen={isPdfPreviewOpen}
        onClose={() => setIsPdfPreviewOpen(false)}
        pdfBlob={pdfBlob}
        filename={pdfFilename}
        onConfirmDownload={handleConfirmPdfDownload}
      />
    </div>
  );
};

export default Reports;