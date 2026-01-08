"use client";

import React from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useColorTheme } from "@/context/ColorThemeContext";
import { cn } from "@/lib/utils";

const colorThemes = [
  { name: "Padrão", value: "default", colorClass: "bg-blue-950" },
  { name: "Nature Vet", value: "nature-vet", colorClass: "bg-landingPage-lp-verde-folha-seca" },
  { name: "Pastel Blue", value: "pastel-blue", colorClass: "bg-sky-300" }, // Cor de preview ajustada
  { name: "Sweet Lilac", value: "sweet-lilac", colorClass: "bg-purple-300" }, // NOVO: Tema Sweet Lilac
];

const ColorThemeToggle = () => {
  const { setColorTheme } = useColorTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Selecionar tema de cor</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-lg shadow-md">
        {colorThemes.map((theme) => (
          <DropdownMenuItem key={theme.value} onClick={() => setColorTheme(theme.value as any)} className="rounded-md">
            <div className="flex items-center">
              <span className={cn("h-4 w-4 rounded-full mr-2", theme.colorClass)}></span>
              {theme.name}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColorThemeToggle;