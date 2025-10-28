"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ListFilter, Syringe, Pill, SprayCan, Wrench, MoreHorizontal, Package, Tag } from "lucide-react"; // Added Tag for generic product category

export interface FilterOption {
  name: string;
  icon: React.ElementType;
  colorClass: string;
  value: string;
}

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  options: FilterOption[]; // Now accepts options as a prop
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelectCategory, options }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
      {options.map((category) => ( // Use options prop
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