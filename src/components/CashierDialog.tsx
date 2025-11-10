"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
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
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  // Queries existentes
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['products', userId, organizationId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!userId,
  });

  const { data: allClients = [], isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ['allClientsCashier', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data as Client[];
    },
    enabled: !!organizationId,
  });

  const { data: allPets = [], isLoading: isLoadingPets } = useQuery<Pet[]>({
    queryKey: ['allPetsCashier', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('organization_id', organizationId);
      if (error) throw error;
      return data as Pet[];
    },
    enabled: !!organizationId,
  });

  // NOVO: Query para buscar débitos do animal selecionado
  const { data: animalDebits = [], isLoading: isLoadingAnimalDebits } = useQuery<AnimalDebit[]>({
    queryKey: ['animalDebitsCashier', selectedPetId, organizationId],
    queryFn: async () => {
      console.log("CashierDialog: Fetching animal debits for petId:", selectedPetId, "organizationId:", organizationId);
      if (!selectedPetId || !organizationId) {
        console.log("CashierDialog: Skipping animal debits query because petId or organizationId is missing.");
        return [];
      }
      const { data, error } = await supabase
        .from('animal_debits')
        .select('*')
        .eq('pet_id', selectedPetId)
        .eq('organization_id', organizationId)
        .eq('is_paid', false); // Apenas débitos pendentes
      if (error) {
        console.error("CashierDialog: Error fetching animal debits:", error);
        throw error;
      }
      console.log("CashierDialog: Animal debits fetched:", data);
      return data as AnimalDebit[];
    },
    enabled: !!selectedPetId && !!organizationId,
  });

  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.total, 0);
  }, [cartItems]);

  const handleAddProduct = (product: Product, quantity: number) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.productId === product.id && !item.isDebit);

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
            isDebit: false,
          },
        ];
      }
    });
  };

  // NOVO: Função memoizada para adicionar um débito de animal ao carrinho
  const handleAddAnimalDebitToCart = React.useCallback((debit: AnimalDebit) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.originalDebitId === debit.id && item.isDebit);

      if (existingItemIndex > -1) {
        return prevItems;
      } else {
        return [
          ...prevItems,
          {
            name: debit.description,
            price: debit.amount,
            quantity: 1,
            total: debit.amount,
            organization_id: organizationId!,
            isDebit: true,
            originalDebitId: debit.id,
            petId: debit.pet_id,
          },
        ];
      }
    });
  }, [organizationId]); // A dependência é estável

  const handleUpdateQuantity = (itemId: string, newQuantity: number, isDebit: boolean) => {
    setCartItems((prevItems) => {
      // Débitos de animais não podem ter a quantidade alterada
      if (isDebit) {
        showError("A quantidade de débitos de animais não pode ser alterada.");
        return prevItems;
      }

      if (newQuantity <= 0) {
        return prevItems.filter((item) => item.productId !== itemId || item.isDebit !== isDebit);
      }
      return prevItems.map((item) =>
        (item.productId === itemId && item.isDebit === isDebit)
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      );
    });
  };

  const handleRemoveItem = (itemId: string, isDebit: boolean) => {
    setCartItems((prevItems) => prevItems.filter((item) => (item.productId !== itemId && item.originalDebitId !== itemId) || item.isDebit !== isDebit));
  };

  const handleCancelSale = () => {
    setCartItems([]);
    setSelectedPetId(null); // Limpa a seleção do pet
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
          description: `Venda de produtos/serviços e débitos`,
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
      const saleItemsPayload = [];
      const debitUpdates = [];

      for (const item of cartItems) {
        if (item.isDebit && item.originalDebitId) {
          // Para débitos de animais, atualiza o status e vincula à transação
          debitUpdates.push(
            supabase
              .from('animal_debits')
              .update({ is_paid: true, transaction_id: transactionId })
              .eq('id', item.originalDebitId)
              .eq('organization_id', organizationId)
          );
        } else if (item.productId) {
          // Para produtos/serviços, insere como sale_item
          saleItemsPayload.push({
            organization_id: item.organization_id,
            transaction_id: transactionId,
            product_id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          });
        }
      }

      // Executa as inserções de sale_items
      if (saleItemsPayload.length > 0) {
        const { error: saleItemsError } = await supabase
          .from('sale_items')
          .insert(saleItemsPayload);
        if (saleItemsError) {
          // Se falhar, tenta reverter a transação e os débitos (se já atualizados)
          await supabase.from('transactions').delete().eq('id', transactionId);
          throw saleItemsError;
        }
      }

      // Executa as atualizações de débitos
      if (debitUpdates.length > 0) {
        const debitResults = await Promise.all(debitUpdates);
        for (const result of debitResults) {
          if (result.error) {
            // Se falhar, tenta reverter a transação e os sale_items (se já inseridos)
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
      queryClient.invalidateQueries({ queryKey: ['animalDebits', selectedPetId, organizationId] }); // Invalida débitos do animal
      setCartItems([]);
      setSelectedPetId(null); // Limpa a seleção do pet
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
    setSelectedPetId(petId);
  };

  // NOVO: Efeito para adicionar débitos automaticamente quando um animal é selecionado
  useEffect(() => {
    if (selectedPetId && animalDebits && !isLoadingAnimalDebits) {
      animalDebits.forEach(debit => {
        handleAddAnimalDebitToCart(debit);
      });
    } else if (!selectedPetId) {
      // Se nenhum animal estiver selecionado, remove apenas os itens de débito do carrinho
      setCartItems(prevItems => {
        const itemsWithoutDebits = prevItems.filter(item => !item.isDebit);
        // Apenas atualiza o estado se houver realmente uma mudança
        if (itemsWithoutDebits.length < prevItems.length) {
          return itemsWithoutDebits;
        }
        return prevItems;
      });
    }
  }, [selectedPetId, animalDebits, isLoadingAnimalDebits, handleAddAnimalDebitToCart]);


  const isLoadingAll = isLoadingProducts || isLoadingClients || isLoadingPets || isLoadingAnimalDebits;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full md:w-[700px] lg:w-[900px] flex flex-col rounded-l-xl shadow-lg">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" /> Caixa
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-6 p-4 overflow-y-auto">
          {/* NOVO: Seleção de Animal */}
          <div className="space-y-4">
            <PetSelectionCombobox
              allClients={allClients}
              allPets={allPets}
              selectedPetId={selectedPetId}
              onSelectPet={handleSelectPet}
            />
          </div>

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
              animalDebits={animalDebits} // Ainda passa para exibir a lista de débitos pendentes
              // onAddAnimalDebitToCart removido, pois agora é automático
              selectedPetId={selectedPetId}
              isLoadingAnimalDebits={isLoadingAnimalDebits}
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
          <Button variant="outline" onClick={onClose} className="rounded-lg">
            <X className="h-4 w-4 mr-2" /> Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CashierDialog;