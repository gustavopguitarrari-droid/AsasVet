"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Search } from "lucide-react";
import { Product } from "@/types/cashier";
import { cn } from "@/lib/utils";

interface ProductSelectorProps {
  onAddProduct: (product: Product, quantity: number) => void;
}

const mockProducts: Product[] = [
  { id: "PROD001", name: "Consulta Geral", price: 150.00, category: "Serviço" },
  { id: "PROD002", name: "Vacina V8", price: 120.00, category: "Serviço" },
  { id: "PROD003", name: "Ração Premium 1kg", price: 85.50, category: "Produto" },
  { id: "PROD004", name: "Shampoo Hipoalergênico", price: 45.00, category: "Produto" },
  { id: "PROD005", name: "Exame de Sangue Completo", price: 200.00, category: "Serviço" },
  { id: "PROD006", name: "Brinquedo Mordedor", price: 30.00, category: "Produto" },
  { id: "PROD007", name: "Anti-pulgas (Pequeno)", price: 70.00, category: "Produto" },
  { id: "PROD008", name: "Castração (Cão)", price: 600.00, category: "Serviço" },
  { id: "PROD009", name: "Hospedagem Diária", price: 50.00, category: "Serviço" },
  { id: "PROD010", name: "Coleira Anti-latido", price: 110.00, category: "Produto" },
];

const ProductSelector: React.FC<ProductSelectorProps> = ({ onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quantityInput, setQuantityInput] = useState<{ [key: string]: number }>({});

  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantityChange = (productId: string, value: string) => {
    const numValue = parseInt(value, 10);
    setQuantityInput((prev) => ({
      ...prev,
      [productId]: isNaN(numValue) || numValue < 1 ? 1 : numValue,
    }));
  };

  const handleAddClick = (product: Product) => {
    const quantity = quantityInput[product.id] || 1;
    onAddProduct(product, quantity);
    setQuantityInput((prev) => ({ ...prev, [product.id]: 1 })); // Reset quantity after adding
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos ou serviços..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ScrollArea className="h-[300px] rounded-md border p-4">
        {filteredProducts.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum produto ou serviço encontrado.</p>
        ) : (
          <div className="space-y-2">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-2 border rounded-md bg-card hover:bg-accent/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.category} - R$ {product.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="1"
                    value={quantityInput[product.id] || 1}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    className="w-20 text-center"
                  />
                  <Button size="icon" onClick={() => handleAddClick(product)}>
                    <PlusCircle className="h-4 w-4" />
                    <span className="sr-only">Adicionar</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ProductSelector;