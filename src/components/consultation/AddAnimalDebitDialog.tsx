"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, DollarSign, Tag, Package, Search as SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types/cashier"; // Importar Product
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  description: z.string().min(1, "A descrição é obrigatória."),
  amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(String(val).replace(',', '.'))), // Converte vírgula para ponto e string vazia para undefined
    z.number().min(0.01, "O valor deve ser maior que zero.")
  ),
  quantity: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().min(1, "A quantidade deve ser pelo menos 1.").default(1)
  ),
  productId: z.string().optional(), // Para vincular a um produto existente
});

export type AddAnimalDebitFormValues = z.infer<typeof formSchema>;

interface AddAnimalDebitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddAnimalDebitFormValues) => void;
  isSubmitting: boolean;
  products: Product[]; // Lista de produtos/serviços disponíveis
}

const AddAnimalDebitDialog: React.FC<AddAnimalDebitDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  products,
}) => {
  const form = useForm<AddAnimalDebitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: undefined,
      quantity: 1,
      productId: undefined,
    },
  });

  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [customDescription, setCustomDescription] = useState<string>("");

  React.useEffect(() => {
    if (isOpen) {
      form.reset();
      setSelectedProductId(undefined);
      setCustomDescription("");
    }
  }, [isOpen, form]);

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue("description", product.name);
      form.setValue("amount", product.price);
      form.setValue("productId", product.id);
      setCustomDescription(""); // Clear custom description
    }
  };

  const handleCustomDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomDescription(e.target.value);
    form.setValue("description", e.target.value);
    form.setValue("productId", undefined); // Clear product selection if custom description is used
    form.setValue("amount", undefined); // Clear amount if custom description is used
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(',', '.'); // Replace comma with dot for numeric conversion
    form.setValue("amount", value === "" ? undefined : parseFloat(value));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("quantity", value === "" ? 1 : parseInt(value, 10));
  };

  const currentQuantity = form.watch("quantity") || 1;
  const currentAmountPerUnit = form.watch("amount") || 0;
  const totalAmount = currentQuantity * currentAmountPerUnit;

  const handleSubmit = (data: AddAnimalDebitFormValues) => {
    // Adjust description and amount based on selection
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        data.description = product.name;
        data.amount = product.price * data.quantity; // Total amount for selected product
        data.productId = product.id;
      }
    } else {
      data.description = customDescription;
      data.amount = totalAmount; // Use calculated total for custom item
      data.productId = undefined;
    }
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <PlusCircle className="h-5 w-5 mr-2" /> Adicionar Débito ao Animal
          </DialogTitle>
          <DialogDescription>
            Registre um serviço ou produto utilizado pelo animal.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <FormLabel className="flex items-center">
                <SearchIcon className="h-4 w-4 mr-2 text-muted-foreground" /> Selecionar Produto/Serviço
              </FormLabel>
              <Select onValueChange={handleProductSelect} value={selectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Buscar ou selecionar um item existente" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    {products.length === 0 ? (
                      <SelectItem value="no-products" disabled>Nenhum produto/serviço cadastrado</SelectItem>
                    ) : (
                      products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center">
                            {product.category === "Produto" ? <Package className="h-4 w-4 mr-2" /> : <Tag className="h-4 w-4 mr-2" />}
                            {product.name} - R$ {product.price.toFixed(2).replace('.', ',')} ({product.category})
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex items-center justify-center text-xs text-muted-foreground">
              <hr className="flex-grow border-t border-border" />
              <span className="px-2 bg-background">OU</span>
              <hr className="flex-grow border-t border-border" />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-muted-foreground" /> Descrição Personalizada
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Consulta de emergência, Raio-X de pata"
                      {...field}
                      value={customDescription}
                      onChange={handleCustomDescriptionChange}
                      disabled={!!selectedProductId} // Disable if a product is selected
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" /> Valor Unitário (R$)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text" // Use text to allow comma input
                        placeholder="0,00"
                        value={field.value === undefined ? "" : String(field.value).replace('.', ',')}
                        onChange={handleAmountChange}
                        disabled={!!selectedProductId} // Disable if a product is selected
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <PlusCircle className="h-4 w-4 mr-2 text-muted-foreground" /> Quantidade
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        onChange={handleQuantityChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between items-center border-t pt-4">
              <p className="text-lg font-semibold">Total do Débito:</p>
              <p className="text-2xl font-bold">R$ {totalAmount.toFixed(2).replace('.', ',')}</p>
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={onClose} type="button" disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {isSubmitting ? "Adicionando..." : "Adicionar Débito"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAnimalDebitDialog;