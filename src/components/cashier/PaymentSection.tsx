"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, DollarSign, QrCode, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccess, showError } from "@/utils/toast"; // Importar toasts

interface PaymentSectionProps {
  totalAmount: number;
  onFinalizeSale: (paymentMethod: string) => void;
  onCancelSale: () => void;
  hasItemsInCart: boolean;
}

const paymentMethods = [
  { value: "Dinheiro", label: "Dinheiro", icon: DollarSign },
  { value: "CartaoCredito", label: "Cartão de Crédito", icon: CreditCard },
  { value: "CartaoDebito", label: "Cartão de Débito", icon: CreditCard },
  { value: "Pix", label: "Pix", icon: QrCode },
];

const PaymentSection: React.FC<PaymentSectionProps> = ({
  totalAmount,
  onFinalizeSale,
  onCancelSale,
  hasItemsInCart,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("Dinheiro");
  const [amountPaid, setAmountPaid] = useState<string>("");

  const handleFinalize = () => {
    if (!hasItemsInCart) {
      showError("Adicione itens à venda antes de finalizar.");
      return;
    }
    if (totalAmount > 0 && parseFloat(amountPaid) < totalAmount && selectedPaymentMethod === "Dinheiro") {
      showError("O valor pago é menor que o total da venda.");
      return;
    }
    onFinalizeSale(selectedPaymentMethod);
    setAmountPaid(""); // Resetar valor pago
    showSuccess("Venda finalizada com sucesso!");
  };

  const change = parseFloat(amountPaid) - totalAmount;

  return (
    <div className="space-y-4 p-4 border rounded-md bg-card">
      <h3 className="text-xl font-semibold">Pagamento</h3>
      <div className="grid gap-2">
        <Label htmlFor="payment-method">Método de Pagamento</Label>
        <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
          <SelectTrigger id="payment-method">
            <SelectValue placeholder="Selecione o método de pagamento" />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                <div className="flex items-center">
                  <method.icon className="h-4 w-4 mr-2 text-muted-foreground" />
                  {method.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPaymentMethod === "Dinheiro" && (
        <div className="grid gap-2">
          <Label htmlFor="amount-paid">Valor Recebido (R$)</Label>
          <Input
            id="amount-paid"
            type="number"
            placeholder="0.00"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            min="0"
            step="0.01"
          />
          {totalAmount > 0 && parseFloat(amountPaid) >= totalAmount && (
            <p className="text-sm text-muted-foreground">
              Troco: <span className="font-bold">R$ {change.toFixed(2).replace('.', ',')}</span>
            </p>
          )}
        </div>
      )}

      <div className="flex justify-between items-center border-t pt-4">
        <p className="text-lg font-semibold">Total a Pagar:</p>
        <p className="text-2xl font-bold">R$ {totalAmount.toFixed(2).replace('.', ',')}</p>
      </div>

      <div className="flex space-x-2 mt-4">
        <Button variant="outline" onClick={onCancelSale} className="flex-1">
          Cancelar Venda
        </Button>
        <Button onClick={handleFinalize} className="flex-1" disabled={!hasItemsInCart || (selectedPaymentMethod === "Dinheiro" && parseFloat(amountPaid) < totalAmount)}>
          <CheckCircle className="h-4 w-4 mr-2" /> Finalizar Venda
        </Button>
      </div>
    </div>
  );
};

export default PaymentSection;