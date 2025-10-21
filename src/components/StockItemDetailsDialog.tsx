"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Package, Wheat, Pill, SprayCan, Wrench, MoreHorizontal, CalendarDays, Syringe } from "lucide-react";

interface ItemEstoque {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  lastUpdate: string;
}

interface StockItemDetailsDialogProps {
  item: ItemEstoque | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mapeamento de categorias para ícones
const categoryIconMap: { [key: string]: React.ElementType } = {
  Insumos: Syringe,
  Farmácia: Pill, // Alterado para Farmácia
  Higiene: SprayCan,
  Equipamentos: Wrench,
  Outros: MoreHorizontal,
};

const StockItemDetailsDialog: React.FC<StockItemDetailsDialogProps> = ({ item, isOpen, onClose }) => {
  if (!item) return null;

  const IconComponent = categoryIconMap[item.category] || Package;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <IconComponent className="h-6 w-6 mr-2 text-muted-foreground" />
            Detalhes do Item: {item.name}
          </DialogTitle>
          <DialogDescription>
            Informações completas sobre {item.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">ID:</p>
            <p className="col-span-2 text-sm">{item.id}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Nome:</p>
            <p className="col-span-2 text-sm font-bold">{item.name}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Categoria:</p>
            <p className="col-span-2 text-sm">{item.category}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Quantidade:</p>
            <p className="col-span-2 text-sm">{item.quantity} {item.unit}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Última Atualização:</p>
            <p className="col-span-2 text-sm flex items-center">
              <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
              {item.lastUpdate}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockItemDetailsDialog;