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
import { PlusCircle, Search, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AddTransactionDialog, { TransactionFormValues } from "@/components/AddTransactionDialog"; // Importa o novo componente
import { format, isToday, parseISO } from "date-fns"; // Importa funções de data

interface Transaction {
  id: string;
  description: string;
  type: "Entrada" | "Saída";
  amount: number; // Alterado para number para cálculos
  date: string; // Mantido como string para exibição, mas será Date no formulário
  time: string;
}

const initialMockCaixa: Transaction[] = [
  { id: "CX001", description: "Pagamento Consulta Rex", type: "Entrada", amount: 150.00, date: "2024-10-26", time: "10:15" },
  { id: "CX002", description: "Pagamento Vacina Miau", type: "Entrada", amount: 120.00, date: "2024-10-26", time: "14:45" },
  { id: "CX003", description: "Retirada para suprimentos", type: "Saída", amount: 200.00, date: "2024-10-25", time: "11:00" },
  { id: "CX004", description: "Pagamento Consulta Dory", type: "Entrada", amount: 80.00, date: format(new Date(), "yyyy-MM-dd"), time: "09:00" },
  { id: "CX005", description: "Compra de ração", type: "Saída", amount: 100.00, date: format(new Date(), "yyyy-MM-dd"), time: "12:30" },
];

const Caixa = () => {
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialMockCaixa);
  const [isAddTransactionDialogOpen, setIsAddTransactionDialogOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const handleAddTransaction = (data: TransactionFormValues) => {
    const newTransaction: Transaction = {
      id: `CX${(transactions.length + 1).toString().padStart(3, '0')}`,
      description: data.description,
      type: data.type,
      amount: parseFloat(data.amount), // Converte para número
      date: format(data.date, "yyyy-MM-dd"),
      time: data.time,
    };
    setTransactions((prev) => [...prev, newTransaction]);
    setIsAddTransactionDialogOpen(false);
  };

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.amount.toFixed(2).includes(searchTerm) ||
    transaction.date.includes(searchTerm) ||
    transaction.time.includes(searchTerm)
  );

  // Cálculos para os cards de resumo
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Caixa</h2>
        <Dialog open={isAddTransactionDialogOpen} onOpenChange={setIsAddTransactionDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Transação
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalBalance.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">+10% do mês passado</p> {/* Este dado ainda é mock */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {entriesToday.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">{transactionsToday.filter(t => t.type === "Entrada").length} transações</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {exitsToday.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">{transactionsToday.filter(t => t.type === "Saída").length} transações</p>
          </CardContent>
        </Card>
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
              <TableHead>ID</TableHead>
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
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>R$ {item.amount.toFixed(2).replace('.', ',')}</TableCell>
                  <TableCell>{format(parseISO(item.date), "dd/MM/yyyy")}</TableCell>
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
                <TableCell colSpan={7} className="h-24 text-center">
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

export default Caixa;