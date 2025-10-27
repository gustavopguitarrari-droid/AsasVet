"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";

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
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import RiskSelector from "./RiskSelector"; // Importar o novo componente RiskSelector

// Mock de veterinários (reutilizando do AppointmentForm)
const mockVeterinarians = [
  { id: "V001", name: "Dr. Ana Paula" },
  { id: "V002", name: "Dr. Carlos Eduardo" },
  { id: "V003", name: "Dra. Beatriz Lima" },
];

const formSchema = z.object({
  bayName: z.string().min(1, "O nome da baia é obrigatório."), // Novo campo
  petName: z.string().min(1, "O nome do animal é obrigatório."),
  ownerName: z.string().min(1, "O nome do tutor é obrigatório."),
  reason: z.string().min(1, "O motivo da internação é obrigatório."),
  admissionDate: z.date({
    required_error: "A data de admissão é obrigatória.",
  }),
  expectedDischargeDate: z.date().optional(),
  veterinarian: z.string().min(1, "O veterinário responsável é obrigatório."),
  species: z.enum(["Cachorro", "Gato", "Pássaro", "Roedor", "Peixe", "Outros"], { // Novo campo de espécie
    required_error: "A espécie do animal é obrigatória.",
  }),
  risk: z.enum(["Sem risco", "Baixo", "Médio", "Alto", "Emergência"], { // Novo campo de risco
    required_error: "O nível de risco é obrigatório.",
  }),
});

export type InternmentFormValues = z.infer<typeof formSchema>;

interface InternmentFormProps {
  onSubmit: (data: InternmentFormValues) => void;
  onCancel: () => void;
}

const InternmentForm: React.FC<InternmentFormProps> = ({ onSubmit, onCancel }) => {
  const form = useForm<InternmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bayName: "", // Valor padrão para o novo campo
      petName: "",
      ownerName: "",
      reason: "",
      admissionDate: new Date(),
      veterinarian: mockVeterinarians[0]?.name || "",
      species: "Cachorro", // Valor padrão para espécie
      risk: "Sem risco", // Valor padrão para risco
    },
  });

  return (
    <Form {...form}> {/* CORREÇÃO AQUI: Usando spread operator para 'form' */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"> {/* CORREÇÃO AQUI: 'form.handleSubmit' no elemento HTML 'form' */}
        <FormField
          control={form.control}
          name="bayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Baia</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Baia 1, UTI, Isolamento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="risk"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Risco</FormLabel>
              <FormControl>
                <RiskSelector value={field.value} onValueChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="petName"
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
          name="ownerName"
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
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo da Internação</FormLabel>
              <FormControl>
                <Textarea placeholder="Descreva o motivo da internação..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="veterinarian"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Veterinário Responsável</FormLabel>
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
            name="admissionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Admissão</FormLabel>
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
                          format(field.value, "PPP", { locale: ptBR })
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
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="expectedDischargeDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Previsão de Alta (Opcional)</FormLabel>
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
                          format(field.value, "PPP", { locale: ptBR })
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
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Internar Paciente</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default InternmentForm;