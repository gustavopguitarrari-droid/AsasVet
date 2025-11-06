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
  { name: "Moderno", value: "neutral-modern", colorClass: "bg-dark-navy-blue-500" }, // Novo tema
];

const ColorThemeToggle = () => {
  const { setColorTheme } = useColorTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Selecionar tema de cor</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {colorThemes.map((theme) => (
          <DropdownMenuItem key={theme.value} onClick={() => setColorTheme(theme.value as any)}>
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