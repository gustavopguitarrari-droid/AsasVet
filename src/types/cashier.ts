export interface Product {
  id: string;
  name: string;
  price: number;
  category: string; // Ex: "Serviço", "Produto"
  user_id: string; // Matches products table
}

export interface SaleItem {
  id: string;
  productId?: string; // Opcional, para produtos/serviços
  name: string;
  price: number;
  quantity: number;
  total: number;
  organization_id: string; // Matches sale_items table
  isDebit?: boolean; // NOVO: Indica se o item é um débito de animal
  originalDebitId?: string; // NOVO: ID do débito original na tabela animal_debits
  petId?: string; // NOVO: ID do pet associado ao débito
  category?: string;
}

export interface AnimalDebit { // NOVO: Interface para débitos de animais
  id: string;
  user_id: string;
  pet_id: string;
  appointment_id?: string | null;
  description: string;
  amount: number;
  is_paid: boolean;
  transaction_id?: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  description: string;
  type: "Entrada" | "Saída";
  amount: number;
  date: string;
  time: string;
  created_at: string;
  sale_items?: SaleItem[]; // Opcional, para transações de venda detalhadas
  payment_method?: string; // Opcional, para transações de venda
  user_id: string; // Matches transactions table (NOT NULL)
  organization_id?: string; // Matches transactions table (NULLABLE)
}