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
import { PlusCircle, Search, DollarSign, ShoppingCart, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format, isToday, parseISO } from "date-fns";

import ProductSelector from "@/components/cashier/ProductSelector";
import SalePanel from "@/components/cashier/SalePanel"; // Importa o novo SalePanel
import { Product, SaleItem, Transaction } from "@/types/cashier";
import { showSuccess } from "@/utils/toast";

const initialMockCaixa: Transaction[] = [
  { id: "CX001", description: "Pagamento Consulta Rex", type: "Entrada", amount: 150.00, date: "2024-10-26", time: "10:15" },
  { id: "CX002", description: "Pagamento Vacina Miau", type: "Entrada", amount: 120.00, date: "2024-10-26", time: "14:45" },
  { id: "CX003", description: "Retirada para suprimentos", type: "Saída", amount: 200.00, date: "2024-10-25", time: "11:00" },
  { id: "CX004", description: "Pagamento Consulta Dory", type: "Entrada", amount: 80.00, date: format(new Date(), "yyyy-MM-dd"), time: "09:00" },
  { id: "CX005", description: "Compra de ração", type: "Saída", amount: 100.00, date: format(new Date(), "yyyy-MM-dd"), time: "12:30" },
];

const Caixa = () => {
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialMockCaixa);
  const [currentSaleItems, setCurrentSaleItems] = React.useState<SaleItem[]>([]);
  const [activeTab, setActiveTab] = React.useState<string>("nova-venda");
  const [historySearchTerm, setHistorySearchTerm] = React.useState<string>("");

  const handleAddItemToSale = (product: Product, quantity: number) => {
    setCurrentSaleItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * product.price }
            : item
        );
      } else {
        return [...prevItems, { productId: product.id, name: product.name, price: product.price, quantity, total: quantity * product.price }];
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
      return; // Should be prevented by PaymentSection, but good to have
    }

    const totalAmount = currentSaleItems.reduce((sum, item) => sum + item.total, 0);
    const newTransaction: Transaction = {
      id: `CX${(transactions.length + 1).toString().padStart(3, '0')}`,
      description: `Venda de ${currentSaleItems.length} itens`,
      type: "Entrada",
      amount: totalAmount,
      date: format(new Date(), "yyyy-MM-dd"),
      time: format(new Date(), "HH:mm"),
      items: currentSaleItems,
      paymentMethod,
    };

    setTransactions((prev) => [...prev, newTransaction]);
    setCurrentSaleItems([]); // Clear the cart
    showSuccess("Venda finalizada com sucesso!");
    setActiveTab("historico"); // Optionally switch to history tab
  };

  const handleCancelSale = () => {
    setCurrentSaleItems([]);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Caixa</h2>
        {/* O botão "Nova Transação" foi removido, pois a funcionalidade de adicionar é agora parte da aba "Nova Venda" */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalBalance.toFixed(2).replace('.', ',')}</div>
            <p className="text-xs text-muted-foreground">Total de todas as transações</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductSelector onAddProduct={handleAddItemToSale} />
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
  );
};

export default Caixa;