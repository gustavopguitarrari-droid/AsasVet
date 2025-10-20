"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns"; // Importar parseISO
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DialogFooter } from "@/components/ui/dialog";

// Mock de veterinários para o select
const mockVeterinarians = [
  { id: "V001", name: "Dr. Ana Paula" },
  { id: "V002", name: "Dr. Carlos Eduardo" },
  { id: "V003", name: "Dra. Beatriz Lima" },
];

const formSchema = z.object({
  date: z.date({
    required_error: "A data da consulta é obrigatória.",
  }),
  time: z.string().min(1, "A hora da consulta é obrigatória."),
  client: z.string().min(1, "O nome do cliente é obrigatório."),
  pet: z.string().min(1, "O nome do animal é obrigatório."),
  species: z.enum(["Cachorro", "Gato", "Pássaro", "Roedor", "Peixe", "Outros"], {
    required_error: "A espécie do animal é obrigatória.",
  }),
  service: z.string().min(1, "O serviço é obrigatório."),
  veterinarian: z.string().min(1, "O veterinário é obrigatório."),
  status: z.enum(["Agendada", "Realizada", "Cancelada", "Em Andamento"], { // Adicionado 'Em Andamento'
    required_error: "O status da consulta é obrigatório.",
  }),
});

export type AppointmentFormValues = z.infer<typeof formSchema>;

interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormValues) => void;
  initialData?: Omit<AppointmentFormValues, "date"> & { date: string }; // Para edição, a data pode vir como string
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit, initialData }) => {
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: initialData?.date ? parseISO(initialData.date) : new Date(), // Converte string para Date
      time: initialData?.time || "",
      client: initialData?.client || "",
      pet: initialData?.pet || "",
      species: initialData?.species || "Cachorro", // Valor padrão para espécie
      service: initialData?.service || "",
      veterinarian: initialData?.veterinarian || "",
      status: initialData?.status || "Agendada",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="client"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <FormControl>
                <Input placeholder="Nome do cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Animal</FormLabel>
              <FormControl>
                <Input placeholder="Nome do animal" {...field} />
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
                  <SelectItem value="Consulta Geral">Consulta Geral</SelectItem>
                  <SelectItem value="Vacinação">Vacinação</SelectItem>
                  <SelectItem value="Exame de Rotina">Exame de Rotina</SelectItem>
                  <SelectItem value="Banho e Tosa">Banho e Tosa</SelectItem>
                  <SelectItem value="Cirurgia">Cirurgia</SelectItem>
                  <SelectItem value="Consulta de Retorno">Consulta de Retorno</SelectItem>
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
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
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
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Agendada" />
                    </FormControl>
                    <FormLabel className="font-normal">Agendada</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Em Andamento" /> {/* Novo item */}
                    </FormControl>
                    <FormLabel className="font-normal">Em Andamento</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Realizada" />
                    </FormControl>
                    <FormLabel className="font-normal">Realizada</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Cancelada" />
                    </FormControl>
                    <FormLabel className="font-normal">Cancelada</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
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