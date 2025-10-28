"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Package, DollarSign, Tag } from "lucide-react";

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
import { Product } from "@/types/cashier";

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  price: z.preprocess(
    (val) => Number(val),
    z.number().min(0.01, "O preço deve ser maior que zero.")
  ),
  category: z.enum(["Serviço", "Produto"], {
    required_error: "A categoria é obrigatória.",
  }),
});

export type AddProductFormValues = z.infer<typeof formSchema>;

interface AddProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddProductFormValues) => void;
  isSubmitting: boolean;
  initialData?: Product; // NEW: Optional initial data for editing
}

const AddProductDialog: React.FC<AddProductDialogProps> = ({ isOpen, onClose, onSubmit, isSubmitting, initialData }) => { // Added initialData
  const form = useForm<AddProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "", // Use initialData
      price: initialData?.price || 0, // Use initialData
      category: (initialData?.category as "Serviço" | "Produto") || "Produto", // Use initialData
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({ // Reset form with initialData when dialog opens
        name: initialData?.name || "",
        price: initialData?.price || 0,
        category: (initialData?.category as "Serviço" | "Produto") || "Produto",
      });
    } else {
      form.reset(); // Reset to empty when dialog closes
    }
  }, [isOpen, form, initialData]); // Added initialData to dependencies

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <PlusCircle className="h-5 w-5 mr-2" /> {initialData ? "Editar Item" : "Adicionar Novo Item"} {/* Dynamic title */}
          </DialogTitle>
          <DialogDescription>
            {initialData ? "Edite os detalhes do produto ou serviço." : "Adicione um novo produto ou serviço ao seu catálogo."} {/* Dynamic description */}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Package className="h-4 w-4 mr-2 text-muted-foreground" /> Nome
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do item" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" /> Preço (R$)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-muted-foreground" /> Categoria
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Produto">Produto</SelectItem>
                      <SelectItem value="Serviço">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={onClose} type="button" disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {isSubmitting ? "Salvando..." : (initialData ? "Salvar Alterações" : "Adicionar Item")} {/* Dynamic button text */}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;