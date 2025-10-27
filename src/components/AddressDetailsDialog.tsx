"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Home, MapPin } from "lucide-react";
import { Client } from "@/types/cadastro";

interface AddressDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  address: Client['address'] | null;
  clientName: string;
}

const AddressDetailsDialog: React.FC<AddressDetailsDialogProps> = ({
  isOpen,
  onClose,
  address,
  clientName,
}) => {
  if (!address) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
            Endereço de {clientName}
          </DialogTitle>
          <DialogDescription>
            Detalhes completos do endereço.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-start gap-4">
            <p className="text-sm font-medium text-muted-foreground">CEP:</p>
            <p className="col-span-2 text-sm">{address.cep || 'N/A'}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-start gap-4">
            <p className="text-sm font-medium text-muted-foreground">Rua:</p>
            <p className="col-span-2 text-sm">{address.street || 'N/A'}, {address.number || 'N/A'}</p>
          </div>
          {address.complement && (
            <>
              <Separator />
              <div className="grid grid-cols-3 items-start gap-4">
                <p className="text-sm font-medium text-muted-foreground">Complemento:</p>
                <p className="col-span-2 text-sm">{address.complement}</p>
              </div>
            </>
          )}
          <Separator />
          <div className="grid grid-cols-3 items-start gap-4">
            <p className="text-sm font-medium text-muted-foreground">Bairro:</p>
            <p className="col-span-2 text-sm">{address.neighborhood || 'N/A'}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-start gap-4">
            <p className="text-sm font-medium text-muted-foreground">Cidade/Estado:</p>
            <p className="col-span-2 text-sm">{address.city || 'N/A'} - {address.state || 'N/A'}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddressDetailsDialog;