"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Pet } from "@/types/cadastro"; // Importa a interface Pet

interface MultiSelectPetsProps {
  allPets: Pet[];
  selectedPetIds: string[];
  onValueChange: (newSelectedPetIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MultiSelectPets: React.FC<MultiSelectPetsProps> = ({
  allPets,
  selectedPetIds,
  onValueChange,
  placeholder = "Selecionar animais...",
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (petId: string) => {
    const newSelected = selectedPetIds.includes(petId)
      ? selectedPetIds.filter((id) => id !== petId)
      : [...selectedPetIds, petId];
    onValueChange(newSelected);
  };

  const selectedPetNames = selectedPetIds
    .map((id) => allPets.find((pet) => pet.id === id)?.name)
    .filter(Boolean) as string[];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[38px]"
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1">
            {selectedPetNames.length > 0 ? (
              selectedPetNames.map((name) => (
                <Badge key={name} variant="secondary">
                  {name}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Buscar animal..." />
          <CommandEmpty>Nenhum animal encontrado.</CommandEmpty>
          <CommandGroup>
            {allPets.map((pet) => (
              <CommandItem
                key={pet.id}
                value={pet.name}
                onSelect={() => handleSelect(pet.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedPetIds.includes(pet.id) ? "opacity-100" : "opacity-0"
                  )}
                />
                {pet.name} ({pet.species})
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelectPets;