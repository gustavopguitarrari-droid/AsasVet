"use client";

import React from "react";
import CheckoutCart from "./CheckoutCart";
import PaymentSection from "./PaymentSection";
import { SaleItem } from "@/types/cashier";

interface SalePanelProps {
  items: SaleItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  totalAmount: number;
  onFinalizeSale: (paymentMethod: string) => void;
  onCancelSale: () => void;
  hasItemsInCart: boolean;
}

const SalePanel: React.FC<SalePanelProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  totalAmount,
  onFinalizeSale,
  onCancelSale,
  hasItemsInCart,
}) => {
  return (
    <div className="space-y-6">
      <CheckoutCart
        items={items}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
      />
      <PaymentSection
        totalAmount={totalAmount}
        onFinalizeSale={onFinalizeSale}
        onCancelSale={onCancelSale}
        hasItemsInCart={hasItemsInCart}
      />
    </div>
  );
};

export default SalePanel;