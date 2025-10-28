export interface Product {
  id: string;
  name: string;
  price: number;
  category: string; // Ex: "Serviço", "Produto"
  user_id: string; // ALTERADO: De organization_id para user_id
}

export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  user_id: string; // ALTERADO: De organization_id para user_id
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
  user_id: string; // ALTERADO: De organization_id para user_id
}