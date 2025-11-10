"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PawPrint, User, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Client, Pet } from "@/types/cadastro";
import { showSuccess } from "@/utils/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PetSelectionComboboxProps {
  allClients: Client[];
  allPets: Pet[];
  selectedPetId?: string | null;
  onSelectPet: (petId: string | null) => void;
}

const PetSelectionCombobox: React.FC<PetSelectionComboboxProps> = ({
  allClients,
  allPets,
  selectedPetId,
  onSelectPet,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selectedPet = React.useMemo(() => {
    return allPets.find((pet) => pet.id === selectedPetId);
  }, [allPets, selectedPetId]);

  const clientMap = React.useMemo(() => {
    return new Map(allClients.map((client) => [client.id, client]));
  }, [allClients]);

  const filteredPets = React.useMemo(() => {
    if (!search) {
      return allPets;
    }
    const lowerCaseSearch = search.toLowerCase();
    return allPets.filter((pet) => {
      const owner = clientMap.get(pet.ownerId);
      return (
        pet.name.toLowerCase().includes(lowerCaseSearch) ||
        pet.species.toLowerCase().includes(lowerCaseSearch) ||
        (owner && owner.name.toLowerCase().includes(lowerCaseSearch))
      );
    });
  }, [allPets, search, clientMap]);

  const handleSelect = (petId: string) => {
    onSelectPet(petId);
    setOpen(false);
    const pet = allPets.find(p => p.id === petId);
    if (pet) {
      const owner = clientMap.get(pet.ownerId);
      showSuccess(`Animal ${pet.name} (${owner?.name || 'Tutor Desconhecido'}) selecionado!`);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center">
        <PawPrint className="h-4 w-4 mr-2 text-muted-foreground" /> Selecionar Animal
      </Label>
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between border border-input rounded-lg"
              >
                {selectedPet
                  ? `${selectedPet.name} (${clientMap.get(selectedPet.ownerId)?.name || 'Tutor Desconhecido'})`
                  : "Buscar ou selecionar animal..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-lg shadow-md">
              <Command className="rounded-lg border">
                <CommandInput
                  placeholder="Buscar animal por nome, espécie ou tutor..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>Nenhum animal encontrado.</CommandEmpty>
                  <CommandGroup>
                    {filteredPets.map((pet) => {
                      const owner = clientMap.get(pet.ownerId);
                      return (
                        <CommandItem
                          key={pet.id}
                          value={`${pet.name} ${pet.species} ${owner?.name || ''}`}
                          onSelect={() => handleSelect(pet.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedPetId === pet.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col items-start">
                            <span>{pet.name} ({pet.species})</span>
                            <span className="text-xs text-muted-foreground">Tutor: {owner?.name || 'Desconhecido'}</span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {selectedPetId && (
          <Button variant="destructive" onClick={() => onSelectPet(null)}>
            <XCircle className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
};

export default PetSelectionCombobox;