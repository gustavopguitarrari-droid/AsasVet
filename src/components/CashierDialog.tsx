"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

interface CashierDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CashierDialog: React.FC<CashierDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full md:w-[700px] lg:w-[900px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" /> Caixa
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-muted-foreground text-lg text-center">
            O caixa está sendo reformulado. Em breve, novas funcionalidades!
          </p>
        </div>
        <SheetFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" /> Fechar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CashierDialog;