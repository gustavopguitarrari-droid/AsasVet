"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, DollarSign, Tag, Package, Search as SearchIcon, ReceiptText } from "lucide-react";

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
import { Product } from "@/types/cashier";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { showError } from "@/utils/toast";

const formSchema = z.object({
  description: z.string().optional(),
  amount: z.preprocess(
    (val) => (val === "" ? undefined : Number(String(val).replace(',', '.'))),
    z.number().optional()
  ),
  quantity: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().int().min(1, "A quantidade deve ser pelo menos 1.").default(1)
  ),
  productId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.productId) {
    if (!data.description || data.description.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A descrição do produto é obrigatória.",
        path: ["description"],
      });
    }
    if (data.amount === undefined || data.amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O valor do produto deve ser maior que zero.",
        path: ["amount"],
      });
    }
  } else {
    if (!data.description || data.description.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A descrição é obrigatória.",
        path: ["description"],
      });
    }
    if (data.amount === undefined || data.amount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O valor deve ser maior que zero.",
        path: ["amount"],
      });
    }
  }
});

export type AddAnimalDebitFormValues = z.infer<typeof formSchema>;

export interface FinalAnimalDebitData extends AddAnimalDebitFormValues {
  calculatedTotalAmount: number;
}

interface AddAnimalDebitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FinalAnimalDebitData) => void;
  isSubmitting: boolean;
  products: Product[];
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

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        description: "",
        amount: undefined,
        quantity: 1,
        productId: undefined,
      });
      setSelectedProductId(undefined);
    }
  }, [isOpen, form]);

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue("description", product.name, { shouldValidate: true });
      form.setValue("amount", product.price, { shouldValidate: true });
      form.setValue("productId", product.id, { shouldValidate: true });
      form.clearErrors(["description", "amount", "productId"]);
    } else {
      // If product is not found (e.g., "no-products" selected), clear product-related fields
      form.setValue("description", "", { shouldValidate: true });
      form.setValue("amount", undefined, { shouldValidate: true });
      form.setValue("productId", undefined, { shouldValidate: true });
      form.clearErrors(["description", "amount", "productId"]);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(',', '.');
    form.setValue("amount", value === "" ? undefined : parseFloat(value), { shouldValidate: true });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("quantity", value === "" ? 1 : parseInt(value, 10), { shouldValidate: true });
  };

  const currentQuantity = form.watch("quantity") || 1;
  const currentAmountPerUnit = form.watch("amount") || 0;
  const totalAmount = useMemo(() => currentQuantity * currentAmountPerUnit, [currentQuantity, currentAmountPerUnit]);

  const handleSubmit = (data: AddAnimalDebitFormValues) => {
    const finalData: FinalAnimalDebitData = {
      ...data,
      calculatedTotalAmount: totalAmount,
    };
    onSubmit(finalData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ReceiptText className="h-5 w-5 mr-2" /> Adicionar Débito ao Animal
          </DialogTitle>
          <DialogDescription>
            Adicione um novo débito para este animal.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center">
                <SearchIcon className="h-4 w-4 mr-2 text-muted-foreground" /> Selecionar Produto/Serviço
              </Label>
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
                      readOnly={!!selectedProductId}
                      onChange={field.onChange} // Sempre usar field.onChange
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
                        type="text"
                        placeholder="0,00"
                        {...field}
                        value={field.value === undefined ? "" : String(field.value).replace('.', ',')}
                        onChange={handleAmountChange}
                        readOnly={!!selectedProductId}
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
              <Button
                disabled={isSubmitting || !form.formState.isValid}
                onClick={() => {
                  if (!form.formState.isValid) {
                    console.log("Form validation errors:", form.formState.errors);
                    showError("Por favor, preencha todos os campos obrigatórios corretamente.");
                  } else {
                    form.handleSubmit(handleSubmit)();
                  }
                }}
              >
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