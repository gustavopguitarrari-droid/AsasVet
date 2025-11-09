"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle, Search as SearchIcon } from "lucide-react";

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
import { Product } from "@/types/cashier";
import { Label } from "@/components/ui/label";

interface ProductComboboxProps {
  onAddProduct: (product: Product, quantity: number) => void;
  products: Product[];
  isLoadingProducts: boolean;
}

const ProductCombobox: React.FC<ProductComboboxProps> = ({ onAddProduct, products, isLoadingProducts }) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(""); // Stores the selected product ID temporarily

  const handleSelectProduct = (productId: string) => {
    const selectedProduct = products.find((product) => product.id === productId);
    if (selectedProduct) {
      onAddProduct(selectedProduct, 1); // Add with default quantity of 1
      setOpen(false);
      setValue(""); // Clear selection after adding
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center">
        <SearchIcon className="h-4 w-4 mr-2 text-muted-foreground" /> Buscar e Adicionar Produtos/Serviços
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between rounded-lg" // Adicionado rounded-lg
            disabled={isLoadingProducts}
          >
            {value
              ? products.find((product) => product.id === value)?.name
              : "Selecionar produto/serviço..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-lg shadow-md"> {/* Adicionado rounded-lg e shadow-md */}
          <Command className="rounded-lg border"> {/* Adicionado borda aqui */}
            <CommandInput placeholder="Buscar produto/serviço..." />
            <CommandList>
              {isLoadingProducts ? (
                <CommandEmpty>Carregando produtos...</CommandEmpty>
              ) : (
                <>
                  <CommandEmpty>Nenhum produto/serviço encontrado.</CommandEmpty>
                  <CommandGroup>
                    {products.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={product.name} // Use product name for search
                        onSelect={() => handleSelectProduct(product.id)}
                      >
                        <PlusCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                        {product.name} - R$ {product.price.toFixed(2).replace('.', ',')} ({product.category})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ProductCombobox;