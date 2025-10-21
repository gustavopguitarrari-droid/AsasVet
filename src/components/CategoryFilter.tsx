"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } => "@/lib/utils";
import { ListFilter, Wheat, Pill, SprayCan, Wrench, MoreHorizontal, FlaskConical, ShoppingCart } from "lucide-react"; // Adicionado FlaskConical e ShoppingCart

interface CategoryOption {
  name: string;
  icon: React.ElementType;
  colorClass: string;
  value: string;
}

const categoryOptions: CategoryOption[] = [
  { name: "Todos", icon: ListFilter, colorClass: "bg-gray-500", value: "all" },
  { name: "Insumos", icon: Wheat, colorClass: "bg-sidebar-item-bg-1", value: "Insumos" },
  { name: "Farmácia", icon: Pill, colorClass: "bg-sidebar-item-bg-4", value: "Farmácia" },
  { name: "Controlados", icon: FlaskConical, colorClass: "bg-sidebar-item-bg-3", value: "Controlados" }, // Nova categoria
  { name: "Loja", icon: ShoppingCart, colorClass: "bg-sidebar-item-bg-7", value: "Loja" }, // Nova categoria
  { name: "Outros", icon: MoreHorizontal, colorClass: "bg-sidebar-item-bg-9", value: "Outros" },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
      {categoryOptions.map((category) => (
        <Tooltip key={category.value} delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-full text-white transition-all duration-200",
                category.colorClass,
                selectedCategory === category.value
                  ? "ring-2 ring-offset-2 ring-current scale-110"
                  : "opacity-70 hover:opacity-100"
              )}
              onClick={() => onSelectCategory(category.value)}
            >
              <category.icon className="h-6 w-6" />
              <span className="sr-only">{category.name}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{category.name}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default CategoryFilter;