"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import *s as z from "zod";
import { PlusCircle, Dog } from "lucide-react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Pet } from "@/types/cadastro";

const formSchema = z.object({
  name: z.string().min(1, "O nome do animal é obrigatório."),
  species: z.enum(["Cachorro", "Gato", "Pássaro", "Roedor", "Peixe", "Outros"], {
    required_error: "A espécie do animal é obrigatória.",
  }),
  breed: z.string().min(1, "A raça do animal é obrigatória."),
});

export type PetFormValues = z.infer<typeof formSchema>;

interface PetFormProps {
  onSubmit: (data: PetFormValues) => void;
  onCancel: () => void;
  initialData?: Pet; // Para edição
  ownerName: string; // Nome do tutor para exibição
}

const PetForm: React.FC<PetFormProps> = ({ onSubmit, onCancel, initialData, ownerName }) => {
  const form = useForm<PetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      species: initialData?.species || "Cachorro",
      breed: initialData?.breed || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Cadastrando animal para o tutor: <span className="font-semibold">{ownerName}</span>
        </p>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Animal</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Rex" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="species"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Espécie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a espécie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Cachorro">Cachorro</SelectItem>
                  <SelectItem value="Gato">Gato</SelectItem>
                  <SelectItem value="Pássaro">Pássaro</SelectItem>
                  <SelectItem value="Roedor">Roedor</SelectItem>
                  <SelectItem value="Peixe">Peixe</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="breed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raça</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Labrador" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Finalizar Cadastro de Animais
          </Button>
          <Button type="submit">
            <PlusCircle className="mr-2 h-4 w-4" /> {initialData ? "Salvar Alterações" : "Adicionar Animal"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default PetForm;