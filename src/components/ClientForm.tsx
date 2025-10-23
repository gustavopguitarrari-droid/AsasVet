"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, User, Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import MultiSelectPets from "./MultiSelectPets"; // Importa o novo componente
import { Client, Pet } from "@/types/cadastro"; // Importa as interfaces

const formSchema = z.object({
  name: z.string().min(1, "O nome do tutor é obrigatório."),
  email: z.string().email("E-mail inválido.").min(1, "O e-mail é obrigatório."),
  phone: z.string().min(1, "O telefone é obrigatório."),
  associatedPetIds: z.array(z.string()).optional(), // IDs dos pets associados
});

export type ClientFormValues = z.infer<typeof formSchema>;

interface ClientFormProps {
  onSubmit: (data: ClientFormValues) => void;
  onCancel: () => void;
  initialData?: Client & { associatedPetIds?: string[] }; // Para edição
  allPets: Pet[]; // Todos os pets disponíveis para seleção
}

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, onCancel, initialData, allPets }) => {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      associatedPetIds: initialData?.associatedPetIds || [],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Tutor</FormLabel>
              <FormControl>
                <Input placeholder="Ex: João Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Ex: joao.silva@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Ex: (XX) XXXXX-XXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="associatedPetIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Animais Associados</FormLabel>
              <FormControl>
                <MultiSelectPets
                  allPets={allPets}
                  selectedPetIds={field.value || []}
                  onValueChange={field.onChange}
                  placeholder="Selecione os animais deste tutor"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            <PlusCircle className="mr-2 h-4 w-4" /> {initialData ? "Salvar Alterações" : "Adicionar Tutor"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ClientForm;