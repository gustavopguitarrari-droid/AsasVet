"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, ListFilter, Horse, Cow } from "lucide-react"; // Adicionado Horse e Cow

interface SpeciesOption {
  name: string;
  icon: React.ElementType;
  colorClass: string;
  value: string;
}

const speciesOptions: SpeciesOption[] = [
  { name: "Todos", icon: ListFilter, colorClass: "bg-gray-500", value: "all" },
  { name: "Cachorro", icon: Dog, colorClass: "bg-sidebar-item-bg-1", value: "Cachorro" },
  { name: "Gato", icon: Cat, colorClass: "bg-sidebar-item-bg-4", value: "Gato" },
  { name: "Pássaro", icon: Bird, colorClass: "bg-sidebar-item-bg-3", value: "Pássaro" },
  { name: "Roedor", icon: Rabbit, colorClass: "bg-sidebar-item-bg-7", value: "Roedor" },
  { name: "Peixe", icon: Fish, colorClass: "bg-sidebar-item-bg-5", value: "Peixe" },
  { name: "Equino", icon: Horse, colorClass: "bg-sidebar-item-bg-2", value: "Equino" }, // Nova espécie com cor
  { name: "Bovino", icon: Cow, colorClass: "bg-sidebar-item-bg-6", value: "Bovino" }, // Nova espécie com cor
  { name: "Outros", icon: MoreHorizontal, colorClass: "bg-sidebar-item-bg-9", value: "Outros" },
];

interface SpeciesFilterProps {
  selectedSpecies: string;
  onSelectSpecies: (species: string) => void;
}

const SpeciesFilter: React.FC<SpeciesFilterProps> = ({ selectedSpecies, onSelectSpecies }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
      {speciesOptions.map((species) => (
        <Tooltip key={species.value} delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full text-white transition-all duration-200",
                species.colorClass,
                selectedSpecies === species.value
                  ? "ring-2 ring-offset-2 ring-current scale-110"
                  : "opacity-70 hover:opacity-100"
              )}
              onClick={() => onSelectSpecies(species.value)}
            >
              <species.icon className="h-6 w-6" />
              <span className="sr-only">{species.name}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{species.name}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default SpeciesFilter;