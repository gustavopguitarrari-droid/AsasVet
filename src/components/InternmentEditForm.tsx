"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO, isValid } from "date-fns"; // Importar isValid
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
import RiskSelector from "./RiskSelector";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  expectedDischargeDate: z.date().nullable().optional(), // Permitir null para data opcional
  veterinarian: z.string().min(1, "O veterinário responsável é obrigatório."),
  species: z.enum(["Cachorro", "Gato", "Pássaro", "Roedor", "Peixe", "Outros"], {
    required_error: "A espécie do animal é obrigatória.",
  }),
  risk: z.enum(["Sem risco", "Baixo", "Médio", "Alto", "Emergência"], {
    required_error: "O nível de risco é obrigatório.",
  }),
  status: z.enum(["Em Observação", "Estável", "Crítico", "Alta", "Óbito"], {
    required_error: "O status é obrigatório.",
  }),
});

export type InternmentEditFormValues = z.infer<typeof formSchema>;

interface InternmentEditFormProps {
  onSubmit: (data: InternmentEditFormValues) => void;
  onCancel: () => void;
  initialData: Omit<InternmentEditFormValues, "admissionDate" | "expectedDischargeDate"> & {
    admissionDate: string;
    expectedDischargeDate?: string | null; // Permitir null ou undefined para a string da data opcional
    bayName: string; // Adicionado
  };
}

const InternmentEditForm: React.FC<InternmentEditFormProps> = ({ onSubmit, onCancel, initialData }) => {
  // Função auxiliar para analisar strings de data com segurança
  const safeParseDate = (dateString?: string | null): Date | undefined => {
    if (!dateString) return undefined;
    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : undefined;
  };

  const form = useForm<InternmentEditFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bayName: initialData.bayName || "", // Valor padrão para o novo campo
      petName: initialData.petName || "",
      ownerName: initialData.ownerName || "",
      reason: initialData.reason || "",
      admissionDate: safeParseDate(initialData.admissionDate) || new Date(), // Fallback para a data atual se inválida
      expectedDischargeDate: safeParseDate(initialData.expectedDischargeDate),
      veterinarian: initialData.veterinarian || mockVeterinarians[0]?.name || "",
      species: initialData.species || "Cachorro",
      risk: initialData.risk || "Sem risco",
      status: initialData.status || "Em Observação",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <RadioGroupItem value="Em Observação" />
                    </FormControl>
                    <FormLabel className="font-normal">Em Observação</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Estável" />
                    </FormControl>
                    <FormLabel className="font-normal">Estável</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Crítico" />
                    </FormControl>
                    <FormLabel className="font-normal">Crítico</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Alta" />
                    </FormControl>
                    <FormLabel className="font-normal">Alta</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Óbito" />
                    </FormControl>
                    <FormLabel className="font-normal">Óbito</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Alterações</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default InternmentEditForm;