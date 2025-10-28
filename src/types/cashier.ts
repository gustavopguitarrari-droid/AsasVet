export interface Product {
  id: string;
  name: string;
  price: number;
  category: string; // Ex: "Serviço", "Produto"
  user_id: string; // Matches products table
}

export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  organization_id: string; // Matches sale_items table
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
  user_id: string; // Matches transactions table (NOT NULL)
  organization_id?: string; // Matches transactions table (NULLABLE)
}