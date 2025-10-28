"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import ProductSelector from "./cashier/ProductSelector";
import CheckoutCart from "./cashier/CheckoutCart"; // Importar CheckoutCart diretamente
import PaymentSection from "./cashier/PaymentSection"; // Importar PaymentSection diretamente
import { Product, SaleItem } from "@/types/cashier";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { showError, showSuccess } from "@/utils/toast";
import { format } from "date-fns";

interface CashierDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CashierDialog: React.FC<CashierDialogProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const organizationId = appUser?.organizationId;

  const [cartItems, setCartItems] = useState<SaleItem[]>([]);

  // Fetch products for the selector
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['products', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!organizationId,
  });

  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  }, [cartItems]);

  const handleAddProduct = (product: Product, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.productId === product.id);

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          total: newQuantity * existingItem.price,
        };
        return updatedItems;
      } else {
        return [
          ...prevItems,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            total: quantity * product.price,
            organization_id: organizationId!, // Ensure organizationId is present
          },
        ];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    setCartItems((prevItems) => {
      if (newQuantity <= 0) {
        return prevItems.filter((item) => item.productId !== productId);
      }
      return prevItems.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      );
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  };

  const handleCancelSale = () => {
    setCartItems([]);
    showError("Venda cancelada.");
  };

  const finalizeSaleMutation = useMutation({
    mutationFn: async (paymentMethod: string) => {
      if (!organizationId) {
        throw new Error("Organization ID not available."); // Lança erro se organizationId não estiver disponível
      }
      if (cartItems.length === 0) throw new Error("Não há itens no carrinho para finalizar a venda.");

      const now = new Date();
      const transactionDate = format(now, "yyyy-MM-dd");
      const transactionTime = format(now, "HH:mm");

      // 1. Create the main transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          organization_id: organizationId,
          description: `Venda de produtos/serviços`,
          type: "Entrada",
          amount: totalAmount,
          date: transactionDate,
          time: transactionTime,
          payment_method: paymentMethod,
        })
        .select('id')
        .single();

      if (transactionError || !transactionData) {
        throw transactionError || new Error("Falha ao criar a transação.");
      }

      const transactionId = transactionData.id;

      // 2. Create the sale items
      const saleItemsPayload = cartItems.map(item => ({
        organization_id: organizationId,
        transaction_id: transactionId,
        product_id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.total,
      }));

      const { error: saleItemsError } = await supabase
        .from('sale_items')
        .insert(saleItemsPayload);

      if (saleItemsError) {
        // If sale items fail, try to roll back the transaction
        await supabase.from('transactions').delete().eq('id', transactionId);
        throw saleItemsError;
      }

      return { transactionId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['products', organizationId] }); // Invalidate products in case stock management is added later
      setCartItems([]);
      showSuccess("Venda finalizada com sucesso!");
      onClose(); // Close cashier after successful sale
    },
    onError: (err: any) => {
      showError(`Erro ao finalizar venda: ${err.message}`);
    },
  });

  const handleFinalizeSale = (paymentMethod: string) => {
    finalizeSaleMutation.mutate(paymentMethod);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full md:w-[700px] lg:w-[900px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" /> Caixa
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-6 p-4 overflow-y-auto">
          {/* 1. Produtos e Serviços */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Produtos e Serviços</h3>
            <ProductSelector
              onAddProduct={handleAddProduct}
              products={products}
              isLoadingProducts={isLoadingProducts}
            />
          </div>

          {/* 2. Carrinho */}
          <div className="space-y-4">
            <CheckoutCart
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          {/* 3. Pagamento */}
          <div className="space-y-4">
            <PaymentSection
              totalAmount={totalAmount}
              onFinalizeSale={handleFinalizeSale}
              onCancelSale={handleCancelSale}
              hasItemsInCart={cartItems.length > 0}
            />
          </div>
        </div>

        <SheetFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" /> Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CashierDialog;