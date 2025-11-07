"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Minus, Plus } from "lucide-react";
import { SaleItem } from "@/types/cashier";
import { cn } from "@/lib/utils";

interface CheckoutCartProps {
  items: SaleItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

const CheckoutCart: React.FC<CheckoutCartProps> = ({ items, onUpdateQuantity, onRemoveItem }) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Carrinho</h3>
      <ScrollArea className="h-[200px] rounded-lg border p-4 shadow-inner"> {/* Altura reduzida, adicionado rounded-lg e shadow-inner */}
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum item no carrinho.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm" // Adicionado p-3, rounded-lg e shadow-sm
              >
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    R$ {item.price.toFixed(2).replace('.', ',')} x {item.quantity}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center border rounded-lg"> {/* Adicionado rounded-lg */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-l-lg" // Adicionado rounded-l-lg
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-r-lg" // Adicionado rounded-r-lg
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => onRemoveItem(item.productId)} className="rounded-lg"> {/* Adicionado rounded-lg */}
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <div className="flex justify-between items-center border-t pt-4">
        <p className="text-lg font-semibold">Total:</p>
        <p className="text-2xl font-bold">R$ {subtotal.toFixed(2).replace('.', ',')}</p>
      </div>
    </div>
  );
};

export default CheckoutCart;