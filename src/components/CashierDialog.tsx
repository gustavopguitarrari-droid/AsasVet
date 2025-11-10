"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, ReceiptText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ProductCombobox from "./cashier/ProductCombobox";
import CheckoutCart from "./cashier/CheckoutCart";
import PaymentSection from "./cashier/PaymentSection";
import { Product, SaleItem, AnimalDebit } from "@/types/cashier";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { showError, showSuccess } from "@/utils/toast";
import { format } from "date-fns";
import { Client, Pet } from "@/types/cadastro";
import PetSelectionCombobox from "./cashier/PetSelectionCombobox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CashierDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CashierDialog: React.FC<CashierDialogProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;
  const organizationId = appUser?.organizationId;

  const [manualCartItems, setManualCartItems] = useState<SaleItem[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  // Queries
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['products', userId, organizationId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase.from('products').select('*').eq('organization_id', organizationId);
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!userId,
  });

  const { data: allClients = [], isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ['allClientsCashier', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase.from('clients').select('*').eq('organization_id', organizationId);
      if (error) throw error;
      return data as Client[];
    },
    enabled: !!organizationId,
  });

  const { data: allPets = [], isLoading: isLoadingPets } = useQuery<Pet[]>({
    queryKey: ['allPetsCashier', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase.from('pets').select('*').eq('organization_id', organizationId);
      if (error) throw error;
      return data as Pet[];
    },
    enabled: !!organizationId,
  });

  const { data: animalDebits = [], isLoading: isLoadingAnimalDebits } = useQuery<AnimalDebit[]>({
    queryKey: ['animalDebitsCashier', selectedPetId, organizationId],
    queryFn: async () => {
      if (!selectedPetId || !organizationId) return [];
      const { data, error } = await supabase.from('animal_debits').select('*').eq('pet_id', selectedPetId).eq('organization_id', organizationId).eq('is_paid', false);
      if (error) throw error;
      return data as AnimalDebit[];
    },
    enabled: !!selectedPetId && !!organizationId,
  });

  // Deriva o carrinho completo a partir dos itens manuais e dos débitos do animal
  const cartItems = useMemo(() => {
    const debitItems = (animalDebits || []).map(debit => ({
      name: debit.description,
      price: debit.amount,
      quantity: 1,
      total: debit.amount,
      organization_id: organizationId!,
      isDebit: true,
      originalDebitId: debit.id,
      petId: debit.pet_id,
      category: 'Débito'
    }));
    return [...manualCartItems, ...debitItems];
  }, [manualCartItems, animalDebits, organizationId]);

  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  }, [cartItems]);

  const handleAddProduct = (product: Product, quantity: number) => {
    setManualCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.productId === product.id && !item.isDebit);
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        updatedItems[existingItemIndex] = { ...existingItem, quantity: newQuantity, total: newQuantity * existingItem.price };
        return updatedItems;
      } else {
        return [...prevItems, {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          total: quantity * product.price,
          organization_id: organizationId!,
          isDebit: false,
          category: product.category,
        }];
      }
    });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number, isDebit: boolean) => {
    if (isDebit) {
      showError("A quantidade de débitos de animais não pode ser alterada.");
      return;
    }
    setManualCartItems((prevItems) => {
      if (newQuantity <= 0) {
        return prevItems.filter((item) => item.productId !== itemId);
      }
      return prevItems.map((item) =>
        (item.productId === itemId) ? { ...item, quantity: newQuantity, total: newQuantity * item.price } : item
      );
    });
  };

  const deleteAnimalDebitMutation = useMutation({
    mutationFn: async (debitId: string) => {
      if (!organizationId) throw new Error("Organization ID not available.");
      const { error } = await supabase
        .from('animal_debits')
        .delete()
        .eq('id', debitId)
        .eq('organization_id', organizationId);
      if (error) throw error;
      return debitId;
    },
    onSuccess: (deletedDebitId) => {
      // Manually update the cache for an instant UI change
      queryClient.setQueryData(
        ['animalDebitsCashier', selectedPetId, organizationId],
        (oldData: AnimalDebit[] | undefined) => {
          if (!oldData) return [];
          return oldData.filter(debit => debit.id !== deletedDebitId);
        }
      );
      // Invalidate to refetch in the background and ensure consistency
      queryClient.invalidateQueries({ queryKey: ['animalDebitsCashier', selectedPetId, organizationId] });
      showSuccess("Débito removido com sucesso!");
    },
    onError: (err: any) => {
      showError(`Erro ao remover débito: ${err.message}`);
    },
  });

  const handleRemoveItem = (itemId: string, isDebit: boolean) => {
    if (isDebit) {
      deleteAnimalDebitMutation.mutate(itemId);
    } else {
      setManualCartItems((prevItems) => prevItems.filter((item) => item.productId !== itemId));
    }
  };

  const handleCancelSale = () => {
    setManualCartItems([]);
    setSelectedPetId(null);
    showError("Venda cancelada.");
  };

  const finalizeSaleMutation = useMutation({
    mutationFn: async (paymentMethod: string) => {
      if (!userId || !organizationId) throw new Error("User or Organization ID not available.");
      if (cartItems.length === 0) throw new Error("Não há itens no carrinho para finalizar a venda.");

      const now = new Date();
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          organization_id: organizationId,
          description: `Venda de produtos/serviços e débitos`,
          type: "Entrada",
          amount: parseFloat(totalAmount.toFixed(2)),
          date: format(now, "yyyy-MM-dd"),
          time: format(now, "HH:mm"),
          payment_method: paymentMethod,
        })
        .select('id')
        .single();

      if (transactionError || !transactionData) throw transactionError || new Error("Falha ao criar a transação.");

      const transactionId = transactionData.id;
      const saleItemsPayload = [];
      const debitUpdates = [];

      for (const item of cartItems) {
        if (item.isDebit && item.originalDebitId) {
          debitUpdates.push(
            supabase.from('animal_debits').update({ is_paid: true, transaction_id: transactionId }).eq('id', item.originalDebitId).eq('organization_id', organizationId)
          );
        } else if (item.productId) {
          saleItemsPayload.push({
            organization_id: item.organization_id,
            transaction_id: transactionId,
            product_id: item.productId,
            name: item.name,
            price: parseFloat(item.price.toFixed(2)),
            quantity: item.quantity,
            total: parseFloat(item.total.toFixed(2)),
          });
        }
      }

      if (saleItemsPayload.length > 0) {
        const { error: saleItemsError } = await supabase.from('sale_items').insert(saleItemsPayload);
        if (saleItemsError) {
          await supabase.from('transactions').delete().eq('id', transactionId);
          throw saleItemsError;
        }
      }

      if (debitUpdates.length > 0) {
        const debitResults = await Promise.all(debitUpdates);
        for (const result of debitResults) {
          if (result.error) {
            await supabase.from('transactions').delete().eq('id', transactionId);
            if (saleItemsPayload.length > 0) {
              await supabase.from('sale_items').delete().eq('transaction_id', transactionId);
            }
            throw result.error;
          }
        }
      }

      return { transactionId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId, organizationId] });
      queryClient.invalidateQueries({ queryKey: ['products', userId, organizationId] });
      queryClient.invalidateQueries({ queryKey: ['animalDebitsCashier', selectedPetId, organizationId] });
      setManualCartItems([]);
      setSelectedPetId(null);
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

  const handleSelectPet = (petId: string | null) => {
    if (!petId) {
      setManualCartItems([]);
    }
    setSelectedPetId(petId);
  };

  const isLoadingAll = isLoadingProducts || isLoadingClients || isLoadingPets || isLoadingAnimalDebits;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[1400px] h-[90vh] flex flex-col rounded-xl shadow-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" /> Caixa
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-6 p-4 overflow-y-auto">
          <div className="space-y-4">
            <PetSelectionCombobox
              allClients={allClients}
              allPets={allPets}
              selectedPetId={selectedPetId}
              onSelectPet={handleSelectPet}
            />
          </div>

          <div className="space-y-4">
            <ProductCombobox
              onAddProduct={handleAddProduct}
              products={products}
              isLoadingProducts={isLoadingProducts}
            />
          </div>

          <div className="space-y-4">
            <CheckoutCart
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          <div className="space-y-4">
            <PaymentSection
              totalAmount={totalAmount}
              onFinalizeSale={handleFinalizeSale}
              onCancelSale={handleCancelSale}
              hasItemsInCart={cartItems.length > 0}
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose} className="rounded-lg">
            <X className="h-4 w-4 mr-2" /> Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CashierDialog;