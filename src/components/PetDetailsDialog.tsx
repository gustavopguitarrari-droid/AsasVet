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
import { Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, User, Calendar, Palette, Heart, Info } from "lucide-react"; // Novos ícones
import { Pet } from "@/types/cadastro"; // Importa a interface Pet
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Importar Avatar

interface PetWithOwnerName extends Pet {
  owner: string; // Adiciona o nome do tutor para exibição
}

interface PetDetailsDialogProps {
  pet: PetWithOwnerName | null; // Usa a nova interface
  isOpen: boolean;
  onClose: () => void;
}

// Mapeamento de espécies para ícones
const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
};

const PetDetailsDialog: React.FC<PetDetailsDialogProps> = ({ pet, isOpen, onClose }) => {
  if (!pet) return null;

  const IconComponent = speciesIconMap[pet.species] || MoreHorizontal;
  const initials = pet.name.charAt(0).toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <IconComponent className="h-6 w-6 mr-2 text-muted-foreground" />
            Ficha do Animal: {pet.name}
          </DialogTitle>
          <DialogDescription>
            Detalhes completos sobre {pet.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-4 border-primary shadow-lg">
              {pet.photoUrl ? (
                <AvatarImage src={pet.photoUrl} alt={pet.name} />
              ) : (
                <AvatarFallback className="bg-muted text-muted-foreground text-3xl font-bold">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">ID:</p>
            <p className="col-span-2 text-sm">{pet.id}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Nome:</p>
            <p className="col-span-2 text-sm font-bold">{pet.name}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Tutor:</p>
            <p className="col-span-2 text-sm flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              {pet.owner}
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Espécie:</p>
            <p className="col-span-2 text-sm">{pet.species}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Raça:</p>
            <p className="col-span-2 text-sm">{pet.breed}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Idade:</p>
            <p className="col-span-2 text-sm flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              {pet.age}
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Sexo:</p>
            <p className="col-span-2 text-sm flex items-center">
              <Heart className="h-4 w-4 mr-2 text-muted-foreground" />
              {pet.gender}
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Cor:</p>
            <p className="col-span-2 text-sm flex items-center">
              <Palette className="h-4 w-4 mr-2 text-muted-foreground" />
              {pet.color}
            </p>
          </div>
          {pet.observations && (
            <>
              <Separator />
              <div className="grid grid-cols-3 items-start gap-4">
                <p className="text-sm font-medium text-muted-foreground">Observações:</p>
                <p className="col-span-2 text-sm flex items-center">
                  <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                  {pet.observations}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PetDetailsDialog;