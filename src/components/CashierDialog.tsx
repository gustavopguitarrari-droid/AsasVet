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
import ProductCombobox from "./cashier/ProductCombobox"; // Importar ProductCombobox
import CheckoutCart from "./cashier/CheckoutCart";
import PaymentSection from "./cashier/PaymentSection";
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
  const userId = appUser?.id;
  const organizationId = appUser?.organizationId;

  const [cartItems, setCartItems] = useState<SaleItem[]>([]);

  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['products', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!userId,
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
            organization_id: organizationId!,
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
      if (!userId || !organizationId) {
        throw new Error("User or Organization ID not available.");
      }
      if (cartItems.length === 0) throw new Error("Não há itens no carrinho para finalizar a venda.");

      const now = new Date();
      const transactionDate = format(now, "yyyy-MM-dd");
      const transactionTime = format(now, "HH:mm");

      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
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

      const saleItemsPayload = cartItems.map(item => ({
        organization_id: item.organization_id,
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
        await supabase.from('transactions').delete().eq('id', transactionId);
        throw saleItemsError;
      }

      return { transactionId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['products', userId] });
      setCartItems([]);
      showSuccess("Venda finalizada com sucesso!");
      onClose();
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
      <SheetContent side="right" className="w-full md:w-[700px] lg:w-[900px] flex flex-col rounded-l-xl shadow-lg"> {/* Adicionado rounded-l-xl e shadow-lg */}
        <SheetHeader className="pb-4"> {/* Adicionado padding inferior */}
          <SheetTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" /> Caixa
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-6 p-4 overflow-y-auto">
          {/* 1. Produtos e Serviços */}
          <div className="space-y-4">
            <ProductCombobox
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

        <SheetFooter className="pt-4"> {/* Adicionado padding superior */}
          <Button variant="outline" onClick={onClose} className="rounded-lg"> {/* Adicionado rounded-lg */}
            <X className="h-4 w-4 mr-2" /> Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CashierDialog;