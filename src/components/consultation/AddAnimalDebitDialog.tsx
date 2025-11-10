"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, DollarSign, Tag, Package, Search as SearchIcon, ReceiptText, ListChecks, Trash2, AlertTriangle } from "lucide-react"; // Adicionado ListChecks, Trash2, AlertTriangle

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
import { Product, AnimalDebit } from "@/types/cashier"; // Importado AnimalDebit
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from "@/utils/toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Importar Tabs
import { Badge } from "@/components/ui/badge"; // Importar Badge
import { cn } from "@/lib/utils"; // Importar cn
import { useMutation, useQueryClient } from "@tanstack/react-query"; // Importar useMutation e useQueryClient
import { supabase } from "@/integrations/supabase/client"; // Importar supabase
import { useUser } from "@/context/UserContext"; // Importar useUser
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent,
  AlertDialogHeader,
  AlertDialogTitle as AlertDialogTitleComponent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Importar AlertDialog

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
  existingAnimalDebits: AnimalDebit[];
  onDeleteDebit: (debitId: string, description: string) => void; // NOVO: Prop para exclusão
}

const AddAnimalDebitDialog: React.FC<AddAnimalDebitDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  products,
  existingAnimalDebits,
  onDeleteDebit, // NOVO
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
  const [activeTab, setActiveTab] = useState<'add-debit' | 'existing-debits'>('add-debit');
  const [debitToDelete, setDebitToDelete] = useState<{ id: string; description: string } | null>(null); // NOVO: Estado para o débito a ser excluído

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        description: "",
        amount: undefined,
        quantity: 1,
        productId: undefined,
      });
      setSelectedProductId(undefined);
      setActiveTab('add-debit'); // Reseta para a aba de adicionar ao abrir
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

  // NOVO: Handler para abrir o AlertDialog de confirmação de exclusão
  const handleOpenDeleteConfirm = (debit: AnimalDebit) => {
    setDebitToDelete({ id: debit.id, description: debit.description });
  };

  // NOVO: Handler para confirmar a exclusão
  const handleConfirmDelete = () => {
    if (debitToDelete) {
      onDeleteDebit(debitToDelete.id, debitToDelete.description);
      setDebitToDelete(null); // Limpa o estado após a exclusão
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ReceiptText className="h-5 w-5 mr-2" /> Débitos do Animal
          </DialogTitle>
          <DialogDescription>
            Gerencie os débitos associados a este animal.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'add-debit' | 'existing-debits')} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 mb-4">
            <TabsTrigger value="add-debit" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold flex items-center">
              <PlusCircle className="h-5 w-5 mr-2" /> Adicionar Débito
            </TabsTrigger>
            <TabsTrigger value="existing-debits" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold flex items-center">
              <ListChecks className="h-5 w-5 mr-2" /> Débitos Existentes ({existingAnimalDebits.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add-debit" className="flex-1 flex flex-col">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-2">
                  <div className="space-y-4">
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
                              onChange={field.onChange}
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
                  </div>
                </ScrollArea>

                <DialogFooter className="pt-4">
                  <Button variant="outline" onClick={onClose} type="button" disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !form.formState.isValid}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Adicionando..." : "Adicionar Débito"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="existing-debits" className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-4 border rounded-lg bg-muted/20 shadow-inner">
              {existingAnimalDebits.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhum débito adicionado para este animal ainda.</p>
              ) : (
                <div className="space-y-3">
                  {existingAnimalDebits.map((debit) => (
                    <div key={debit.id} className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
                      <div className="flex-1">
                        <p className="font-medium flex items-center">
                          <ReceiptText className="h-4 w-4 mr-2 text-muted-foreground" />
                          {debit.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          R$ {debit.amount.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={cn(
                          "text-white",
                          debit.is_paid ? "bg-green-500" : "bg-orange-500"
                        )}>
                          {debit.is_paid ? "Pago" : "Pendente"}
                        </Badge>
                        {!debit.is_paid && ( // Só permite excluir se não estiver pago
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                onClick={() => handleOpenDeleteConfirm(debit)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Excluir Débito</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitleComponent className="flex items-center">
                                  <AlertTriangle className="h-5 w-5 mr-2 text-destructive" /> Confirmar Exclusão
                                </AlertDialogTitleComponent>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o débito: <span className="font-bold">{debitToDelete?.description || debit.description}</span>?
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooterComponent>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooterComponent>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Fechar
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddAnimalDebitDialog;