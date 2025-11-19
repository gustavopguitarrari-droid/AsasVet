"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon, Search, User, PawPrint, MoreHorizontal, Check, ChevronsUpDown } from "lucide-react";
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
import { Client, Pet } from "@/types/cadastro";
import { showError, showSuccess } from "@/utils/toast";
import { Label } from "@/components/ui/label";
import { TeamMember } from "@/pages/Veterinarios";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const formSchema = z.object({
  bayName: z.string().min(1, "O nome da baia é obrigatório."),
  
  // Campos para seleção de cliente/pet
  selectedClientId: z.string().min(1, "Selecione um tutor."),
  selectedPetId: z.string().min(1, "Selecione um animal."),

  // Campos que serão preenchidos automaticamente e enviados na mutação
  petName: z.string().min(1, "O nome do animal é obrigatório."),
  ownerName: z.string().min(1, "O nome do tutor é obrigatório."),
  species: z.enum(["Cachorro", "Gato", "Pássaro", "Roedor", "Peixe", "Outros", "Equino", "Bovino"], {
    required_error: "A espécie do animal é obrigatória.",
  }),

  reason: z.string().min(1, "O motivo da internação é obrigatório."),
  admissionDate: z.date({
    required_error: "A data de admissão é obrigatória.",
  }),
  expectedDischargeDate: z.date().optional().nullable(),
  veterinarian: z.string().min(1, "O veterinário responsável é obrigatório."),
  risk: z.enum(["Sem risco", "Baixo", "Médio", "Alto", "Emergência"], {
    required_error: "O nível de risco é obrigatório.",
  }),
});

export type InternmentFormValues = z.infer<typeof formSchema>;

interface InternmentFormProps {
  onSubmit: (data: InternmentFormValues) => void;
  onCancel: () => void;
  initialData?: Partial<InternmentFormValues>;
  isSubmittingParent?: boolean;
  allClients: Client[];
  allPets: Pet[];
  allVeterinarians: TeamMember[];
}

const InternmentForm: React.FC<InternmentFormProps> = ({ onSubmit, onCancel, initialData, isSubmittingParent = false, allClients, allPets, allVeterinarians }) => {
  const safeParseDate = (dateString?: string | null): Date | undefined => {
    if (!dateString) return undefined;
    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : undefined;
  };

  const form = useForm<InternmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bayName: initialData?.bayName || "",
      
      selectedClientId: initialData?.selectedClientId || "",
      selectedPetId: initialData?.selectedPetId || "",

      petName: initialData?.petName || "",
      ownerName: initialData?.ownerName || "",
      species: initialData?.species || "Cachorro",

      reason: initialData?.reason || "",
      admissionDate: initialData?.admissionDate || new Date(),
      expectedDischargeDate: initialData?.expectedDischargeDate || null,
      veterinarian: initialData?.veterinarian || (allVeterinarians.length > 0 ? `${allVeterinarians[0].first_name} ${allVeterinarians[0].last_name || ''}`.trim() : ""),
      risk: initialData?.risk || "Sem risco",
    },
  });

  const [openClientCombobox, setOpenClientCombobox] = useState(false);
  const [clientSearchInput, setClientSearchInput] = useState<string>("");
  const [selectedClientFromSearch, setSelectedClientFromSearch] = useState<Client | null>(null);
  const [selectedPetFromDropdown, setSelectedPetFromDropdown] = useState<Pet | null>(null);

  useEffect(() => {
    form.reset({
      bayName: initialData?.bayName || "",
      
      selectedClientId: initialData?.selectedClientId || "",
      selectedPetId: initialData?.selectedPetId || "",

      petName: initialData?.petName || "",
      ownerName: initialData?.ownerName || "",
      species: initialData?.species || "Cachorro",

      reason: initialData?.reason || "",
      admissionDate: initialData?.admissionDate || new Date(),
      expectedDischargeDate: initialData?.expectedDischargeDate || null,
      veterinarian: initialData?.veterinarian || (allVeterinarians.length > 0 ? `${allVeterinarians[0].first_name} ${allVeterinarians[0].last_name || ''}`.trim() : ""),
      risk: initialData?.risk || "Sem risco",
    });
    setClientSearchInput("");
    setSelectedClientFromSearch(null);
    setSelectedPetFromDropdown(null);

    // If initialData has client/pet IDs, pre-populate search and selection
    if (initialData?.selectedClientId) {
      const client = allClients.find(c => c.id === initialData.selectedClientId);
      if (client) {
        setSelectedClientFromSearch(client);
        form.setValue("selectedClientId", client.id);
        form.setValue("ownerName", client.name);
        setClientSearchInput(client.name); // Pre-fill combobox input
      }
    }
    if (initialData?.selectedPetId) {
      const pet = allPets.find(p => p.id === initialData.selectedPetId);
      if (pet) {
        setSelectedPetFromDropdown(pet);
        form.setValue("selectedPetId", pet.id);
        form.setValue("petName", pet.name);
        form.setValue("species", pet.species as InternmentFormValues["species"]);
      }
    }
  }, [initialData, form, allClients, allPets, allVeterinarians]);

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
      form.setValue("ownerName", client.name);
      setClientSearchInput(client.name); // Display selected client's name in input
      showSuccess(`Tutor ${client.name} selecionado!`);
      // Reset pet selection when client changes
      setSelectedPetFromDropdown(null);
      form.setValue("selectedPetId", "");
      form.setValue("petName", "");
      form.setValue("species", "Cachorro");
      setOpenClientCombobox(false); // Close combobox
    }
  };

  const handlePetSelection = (petId: string) => {
    const pet = allPets.find(p => p.id === petId);
    if (pet) {
      setSelectedPetFromDropdown(pet);
      form.setValue("selectedPetId", pet.id);
      form.setValue("petName", pet.name);
      form.setValue("species", pet.species as InternmentFormValues["species"]);
    }
  };

  const petsOfSelectedClient = selectedClientFromSearch
    ? allPets.filter(pet => pet.ownerId === selectedClientFromSearch.id)
    : [];

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
                disabled={!!initialData?.selectedClientId}
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
                  disabled={!selectedClientFromSearch || petsOfSelectedClient.length === 0 || !!initialData?.selectedPetId}
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
          name="petName"
          render={({ field }) => <Input type="hidden" {...field} />}
        />
        <FormField
          control={form.control}
          name="ownerName"
          render={({ field }) => <Input type="hidden" {...field} />}
        />
        <FormField
          control={form.control}
          name="species"
          render={({ field }) => <Input type="hidden" {...field} />}
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
              <Select onValueChange={field.onChange} value={field.value} disabled={!!initialData?.veterinarian}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veterinário" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {allVeterinarians.map((vet) => (
                    <SelectItem key={vet.id} value={`${vet.first_name} ${vet.last_name || ''}`.trim()}>
                      {`${vet.first_name} ${vet.last_name || ''}`.trim()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          {/* Admission Date Field - Fixed Popover Trigger */}
          <FormField
            control={form.control}
            name="admissionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Admissão</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
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
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => field.onChange(date)}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Expected Discharge Date Field - Fixed Popover Trigger */}
          <FormField
            control={form.control}
            name="expectedDischargeDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Previsão de Alta (Opcional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
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
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={(date) => field.onChange(date)}
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
          <Button variant="outline" onClick={onCancel} type="button" disabled={isSubmittingParent}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmittingParent}>
            {isSubmittingParent ? "Internando..." : "Internar Paciente"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default InternmentForm;