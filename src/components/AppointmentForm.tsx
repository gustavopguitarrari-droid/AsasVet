"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
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
import AppointmentDateSelector from "./AppointmentDateSelector"; // Importar o novo seletor de data
import { Client, Pet } from "@/types/cadastro"; // Importar as interfaces Client e Pet

// Mock de veterinários para o select
const mockVeterinarians = [
  { id: "V001", name: "Dr. Ana Paula" },
  { id: "V002", name: "Dr. Carlos Eduardo" },
  { id: "V003", name: "Dra. Beatriz Lima" },
];

// Definir as opções de serviço como um array para reutilização
const serviceOptions = [
  "Consulta Geral",
  "Vacinação",
  "Exame de Rotina",
  "Banho e Tosa",
  "Cirurgia",
  "Consulta de Retorno",
] as const; // 'as const' para inferir como tupla de strings literais

const formSchema = z.object({
  dateOption: z.enum(["today", "specific"], {
    required_error: "Selecione uma opção de data.",
  }),
  date: z.date().optional(), // Optional, as it's only required if dateOption is "specific"
  time: z.string().min(1, "A hora da consulta é obrigatória."),
  clientId: z.string().min(1, "O tutor é obrigatório."), // Novo campo para ID do cliente
  petId: z.string().min(1, "O animal é obrigatório."),     // Novo campo para ID do pet
  service: z.enum(serviceOptions, { // Usar o array de opções para o enum
    required_error: "O serviço é obrigatório.",
  }),
  veterinarian: z.string().min(1, "O veterinário é obrigatório."),
}).superRefine((data, ctx) => {
  if (data.dateOption === "specific" && !data.date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A data é obrigatória para agendamento específico.",
      path: ["date"],
    });
  }
});

export type AppointmentFormValues = z.infer<typeof formSchema>;

interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormValues) => void;
  initialData?: { // Simplified initialData type for clarity in this context
    time?: string;
    clientId?: string; // Usar clientId
    petId?: string;     // Usar petId
    service?: typeof serviceOptions[number];
    veterinarian?: string;
    date?: string; // Date as string from existing appointment
    status?: "Agendada" | "Realizada" | "Cancelada" | "Em Andamento"; // Status as string
  };
  allClients: Client[]; // Receber todos os clientes
  allPets: Pet[];       // Receber todos os pets
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit, initialData, allClients, allPets }) => {
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateOption: initialData?.date ? "specific" : "today",
      date: initialData?.date ? new Date(initialData.date) : undefined,
      time: initialData?.time || format(new Date(), "HH:mm"),
      clientId: initialData?.clientId || "",
      petId: initialData?.petId || "",
      service: initialData?.service || serviceOptions[0],
      veterinarian: initialData?.veterinarian || mockVeterinarians[0]?.name || "",
    },
  });

  const selectedClientId = form.watch("clientId");
  const petsForSelectedClient = React.useMemo(() => {
    return allPets.filter(pet => pet.ownerId === selectedClientId);
  }, [selectedClientId, allPets]);

  // Reset petId if selected client changes and the current pet is no longer valid
  React.useEffect(() => {
    if (selectedClientId && form.getValues("petId")) {
      const currentPetBelongsToClient = petsForSelectedClient.some(
        (pet) => pet.id === form.getValues("petId")
      );
      if (!currentPetBelongsToClient) {
        form.setValue("petId", "");
      }
    }
  }, [selectedClientId, petsForSelectedClient, form]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <AppointmentDateSelector /> {/* Novo componente de seleção de data */}
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hora</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tutor</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tutor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {allClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="petId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Animal</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClientId}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o animal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {petsForSelectedClient.length === 0 ? (
                    <SelectItem value="no-pets" disabled>Nenhum animal para este tutor</SelectItem>
                  ) : (
                    petsForSelectedClient.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="service"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serviço</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {serviceOptions.map((service) => ( // Mapear as opções do array
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="veterinarian"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Veterinário</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veterinário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockVeterinarians.map((vet) => (
                    <SelectItem key={vet.id} value={vet.name}>
                      {vet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit">{initialData ? "Salvar Alterações" : "Agendar"}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default AppointmentForm;