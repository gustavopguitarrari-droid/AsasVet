"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO, isValid, isSameDay } from "date-fns";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Client, Pet } from "@/types/cadastro";
import { showError, showSuccess } from "@/utils/toast";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, User, PawPrint, Check, ChevronsUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Definir as opções de serviço como um array para reutilização
const serviceOptions = [
  "Consulta Geral",
  "Vacinação",
  "Exame de Rotina",
  "Banho e Tosa",
  "Cirurgia",
  "Consulta de Retorno",
] as const;

const formSchema = z.object({
  date: z.date({
    required_error: "A data da consulta é obrigatória.",
  }),
  time: z.string().min(1, "A hora da consulta é obrigatória."),
  
  selectedClientId: z.string().min(1, "Selecione um tutor."),
  selectedPetId: z.string().min(1, "Selecione um animal."),

  client: z.string().min(1, "O nome do cliente é obrigatório."),
  pet: z.string().min(1, "O nome do animal é obrigatório."),
  species: z.enum(["Cachorro", "Gato", "Pássaro", "Roedor", "Peixe", "Outros", "Equino", "Bovino"], {
    required_error: "A espécie do animal é obrigatória.",
  }),
  service: z.enum(serviceOptions, {
    required_error: "O serviço é obrigatório.",
  }),
  dateOption: z.enum(["today", "specific"]).default("today"),
});

export type AppointmentFormValues = z.infer<typeof formSchema>;

interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormValues) => void;
  onCancel: () => void;
  initialData?: {
    time?: string;
    client?: string;
    pet?: string;
    species?: "Cachorro" | "Gato" | "Pássaro" | "Roedor" | "Peixe" | "Outros" | "Equino" | "Bovino";
    service?: typeof serviceOptions[number];
    veterinarian?: string;
    date?: string;
    status?: "Agendada" | "Realizada" | "Cancelada" | "Em Andamento";
    selectedClientId?: string;
    selectedPetId?: string;
    dateOption?: "today" | "specific";
  };
  allClients: Client[];
  allPets: Pet[];
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit, onCancel, initialData, allClients, allPets }) => {
  const { user: appUser } = useUser();
  const userId = appUser?.id;

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: initialData?.date ? parseISO(initialData.date) : new Date(),
      time: initialData?.time || format(new Date(), "HH:mm"),
      
      selectedClientId: initialData?.selectedClientId || "",
      selectedPetId: initialData?.selectedPetId || "",

      client: initialData?.client || "",
      pet: initialData?.pet || "",
      species: initialData?.species || "Cachorro",
      service: initialData?.service || serviceOptions[0],
      dateOption: initialData?.dateOption || "today",
    },
  });

  const [openClientCombobox, setOpenClientCombobox] = useState(false);
  const [clientSearchInput, setClientSearchInput] = useState<string>("");
  const [selectedClientFromSearch, setSelectedClientFromSearch] = useState<Client | null>(null);
  const [selectedPetFromDropdown, setSelectedPetFromDropdown] = useState<Pet | null>(null);

  // Reset form and states when initialData changes (e.g., dialog opens for new appointment)
  useEffect(() => {
    form.reset({
      date: initialData?.date ? parseISO(initialData.date) : new Date(),
      time: initialData?.time || format(new Date(), "HH:mm"),
      
      selectedClientId: initialData?.selectedClientId || "",
      selectedPetId: initialData?.selectedPetId || "",

      client: initialData?.client || "",
      pet: initialData?.pet || "",
      species: initialData?.species || "Cachorro",
      service: initialData?.service || serviceOptions[0],
      dateOption: initialData?.dateOption || "today",
    });
    setClientSearchInput("");
    setSelectedClientFromSearch(null);
    setSelectedPetFromDropdown(null);

    // If initialData has client/pet, pre-populate search and selection
    if (initialData?.selectedClientId) {
      const client = allClients.find(c => c.id === initialData.selectedClientId);
      if (client) {
        setSelectedClientFromSearch(client);
        form.setValue("selectedClientId", client.id);
        form.setValue("client", client.name);
        setClientSearchInput(client.name);
      }
    }
    if (initialData?.selectedPetId) {
      const pet = allPets.find(p => p.id === initialData.selectedPetId);
      if (pet) {
        setSelectedPetFromDropdown(pet);
        form.setValue("selectedPetId", pet.id);
        form.setValue("pet", pet.name);
        form.setValue("species", pet.species as AppointmentFormValues["species"]);
      }
    }
  }, [initialData, form, allClients, allPets]);

  const filteredClients = React.useMemo(() => {
    if (!clientSearchInput) return allClients;
    const lowerCaseSearchTerm = clientSearchInput.toLowerCase();
    return allClients.filter(client => 
      client.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      client.cpf.replace(/\D/g, '').includes(lowerCaseSearchTerm.replace(/\D/g, ''))
    );
  }, [allClients, clientSearchInput]);

  const handleSelectClient = (clientId: string) => {
    const client = allClients.find(c => c.id === clientId);
    if (client) {
      setSelectedClientFromSearch(client);
      form.setValue("selectedClientId", client.id);
      form.setValue("client", client.name);
      setClientSearchInput(client.name); // Display selected client's name in input
      showSuccess(`Tutor ${client.name} selecionado!`);
      // Reset pet selection when client changes
      setSelectedPetFromDropdown(null);
      form.setValue("selectedPetId", "");
      form.setValue("pet", "");
      form.setValue("species", "Cachorro");
      setOpenClientCombobox(false); // Close combobox
    }
  };

  const handlePetSelection = (petId: string) => {
    const pet = allPets.find(p => p.id === petId);
    if (pet) {
      setSelectedPetFromDropdown(pet);
      form.setValue("selectedPetId", pet.id);
      form.setValue("pet", pet.name);
      form.setValue("species", pet.species as AppointmentFormValues["species"]);
    }
  };

  const petsOfSelectedClient = selectedClientFromSearch
    ? allPets.filter(pet => pet.ownerId === selectedClientFromSearch.id)
    : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data da Consulta</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled // Adicionado disabled aqui para bloquear o PopoverTrigger
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={ptBR}
                      disabled={(date) => !isSameDay(date, new Date())}
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
                <FormLabel>Hora da Consulta</FormLabel>
                <FormControl>
                  <Input type="time" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Busca de Tutor por CPF ou Nome - Usando Combobox */}
        <div className="space-y-2 border p-3 rounded-md">
          <Label className="flex items-center">
            <User className="h-4 w-4 mr-2 text-muted-foreground" /> Selecionar Tutor (Nome ou CPF)
          </Label>
          <Popover open={openClientCombobox} onOpenChange={setOpenClientCombobox}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openClientCombobox}
                className="w-full justify-between"
              >
                {selectedClientFromSearch
                  ? selectedClientFromSearch.name
                  : "Buscar ou selecionar tutor..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
              <Command>
                <CommandInput
                  placeholder="Buscar tutor por nome ou CPF..."
                  value={clientSearchInput}
                  onValueChange={setClientSearchInput}
                />
                <CommandList>
                  <CommandEmpty>Nenhum tutor encontrado.</CommandEmpty>
                  <CommandGroup>
                    {filteredClients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={`${client.name} ${client.cpf}`} // Use both for searchability
                        onSelect={() => handleSelectClient(client.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedClientFromSearch?.id === client.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {client.name} (CPF: {client.cpf})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormField
            control={form.control}
            name="selectedClientId"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Seleção de Animal */}
        <div className="space-y-2 border p-3 rounded-md">
          <Label className="flex items-center">
            <PawPrint className="h-4 w-4 mr-2 text-muted-foreground" /> Selecionar Animal
          </Label>
          <FormField
            control={form.control}
            name="selectedPetId"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={handlePetSelection}
                  value={field.value}
                  disabled={!selectedClientFromSearch || petsOfSelectedClient.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedClientFromSearch ? "Selecione o animal" : "Busque um tutor primeiro"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {petsOfSelectedClient.length > 0 ? (
                      petsOfSelectedClient.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name} ({pet.species})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-pets" disabled>
                        Nenhum animal para este tutor
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {selectedPetFromDropdown && (
            <p className="text-sm text-muted-foreground mt-2">
              Animal selecionado: <span className="font-semibold">{selectedPetFromDropdown.name} ({selectedPetFromDropdown.species})</span>
            </p>
          )}
        </div>

        {/* Campos ocultos que serão preenchidos para a mutação */}
        <FormField
          control={form.control}
          name="client"
          render={({ field }) => <Input type="hidden" {...field} />}
        />
        <FormField
          control={form.control}
          name="pet"
          render={({ field }) => <Input type="hidden" {...field} />}
        />
        <FormField
          control={form.control}
          name="species"
          render={({ field }) => <Input type="hidden" {...field} />}
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
                  {serviceOptions.map((service) => (
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
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} type="button">
            Cancelar
          </Button>
          <Button type="submit">Adicionar na espera</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default AppointmentForm;