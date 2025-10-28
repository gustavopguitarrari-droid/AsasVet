export interface Product {
  id: string;
  name: string;
  price: number;
  category: string; // Ex: "Serviço", "Produto"
}

export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Transaction {
  id: string;
  description: string;
  type: "Entrada" | "Saída";
  amount: number;
  date: string;
  time: string;
  items?: SaleItem[]; // Opcional, para transações de venda detalhadas
  paymentMethod?: string; // Opcional, para transações de venda
}