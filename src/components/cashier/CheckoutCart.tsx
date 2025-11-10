"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Minus, Plus, ReceiptText, DollarSign, CheckCircle, AlertTriangle } from "lucide-react";
import { SaleItem, AnimalDebit } from "@/types/cashier";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CheckoutCartProps {
  items: SaleItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number, isDebit: boolean) => void;
  onRemoveItem: (itemId: string, isDebit: boolean) => void;
}

const CheckoutCart: React.FC<CheckoutCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

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
                    {item.category && <Badge variant="outline" className="ml-2">{item.category}</Badge>}
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
                  {item.isDebit ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-destructive" /> Confirmar Exclusão
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o débito: <span className="font-bold">{item.name}</span>?
                            Esta ação removerá o débito permanentemente do histórico do animal.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onRemoveItem(item.originalDebitId!, true)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Excluir Débito
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onRemoveItem(item.productId!, false)}
                      className="rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
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