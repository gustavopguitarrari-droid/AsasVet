"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Minus, Plus, ReceiptText, DollarSign, CheckCircle } from "lucide-react";
import { SaleItem, AnimalDebit } from "@/types/cashier";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CheckoutCartProps {
  items: SaleItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number, isDebit: boolean) => void;
  onRemoveItem: (itemId: string, isDebit: boolean) => void;
  animalDebits: AnimalDebit[];
  // onAddAnimalDebitToCart removido
  selectedPetId?: string | null;
  isLoadingAnimalDebits: boolean;
}

const CheckoutCart: React.FC<CheckoutCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  animalDebits,
  // onAddAnimalDebitToCart removido
  selectedPetId,
  isLoadingAnimalDebits,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  console.log("CheckoutCart: Received animalDebits prop:", animalDebits);
  console.log("CheckoutCart: isLoadingAnimalDebits:", isLoadingAnimalDebits);
  console.log("CheckoutCart: selectedPetId:", selectedPetId);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Carrinho</h3>
      <ScrollArea className="h-[200px] rounded-lg border p-4 shadow-inner">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum item no carrinho.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.isDebit ? `debit-${item.originalDebitId}` : `product-${item.productId}`}
                className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm"
              >
                <div className="flex-1">
                  <p className="font-medium flex items-center">
                    {item.isDebit && <ReceiptText className="h-4 w-4 mr-2 text-muted-foreground" />}
                    {item.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    R$ {item.price.toFixed(2).replace('.', ',')} {item.isDebit ? '' : `x ${item.quantity}`}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {!item.isDebit && (
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-l-lg"
                        onClick={() => onUpdateQuantity(item.productId!, item.quantity - 1, false)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-r-lg"
                        onClick={() => onUpdateQuantity(item.productId!, item.quantity + 1, false)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onRemoveItem(item.isDebit ? item.originalDebitId! : item.productId!, item.isDebit || false)}
                    className="rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {selectedPetId && (
        <div className="space-y-3 border-t pt-4">
          <h4 className="text-lg font-semibold flex items-center">
            <ReceiptText className="h-5 w-5 mr-2" /> Débitos Pendentes do Animal
          </h4>
          <ScrollArea className="h-[150px] rounded-lg border p-3 shadow-inner bg-muted/20">
            {isLoadingAnimalDebits ? (
              <p className="text-center text-muted-foreground">Carregando débitos...</p>
            ) : animalDebits.length === 0 ? (
              <p className="text-center text-muted-foreground">Nenhum débito pendente para este animal.</p>
            ) : (
              <div className="space-y-3">
                {animalDebits.map((debit) => (
                  <div key={debit.id} className="flex items-center justify-between p-2 border rounded-lg bg-card shadow-sm">
                    <div className="flex-1">
                      <p className="font-medium">{debit.description}</p>
                      <p className="text-sm text-muted-foreground">R$ {debit.amount.toFixed(2).replace('.', ',')}</p>
                    </div>
                    {/* Botão "Adicionar" removido, pois os débitos são adicionados automaticamente */}
                    <Badge className={cn(
                      "text-white",
                      debit.is_paid ? "bg-green-500" : "bg-orange-500"
                    )}>
                      {debit.is_paid ? "Pago" : "Pendente"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}

      <div className="flex justify-between items-center border-t pt-4">
        <p className="text-lg font-semibold">Total:</p>
        <p className="text-2xl font-bold">R$ {subtotal.toFixed(2).replace('.', ',')}</p>
      </div>
    </div>
  );
};

export default CheckoutCart;