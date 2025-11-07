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
import { User, Mail, Phone, Home, MapPin, Calendar, IdCard, Info, Edit, Trash2, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal } from "lucide-react";
import { Client } from "@/types/cadastro";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientDetailsDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string, clientName: string) => void;
  onViewPets: (client: Client) => void;
}

const ClientDetailsDialog: React.FC<ClientDetailsDialogProps> = ({
  client,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onViewPets,
}) => {
  if (!client) return null;

  const initials = `${client.name.charAt(0)}${client.name.split(' ').pop()?.charAt(0) || ''}`.toUpperCase();

  const handleDeleteClick = () => {
    if (window.confirm(`Tem certeza que deseja excluir o tutor ${client.name} e todos os seus animais? Esta ação não pode ser desfeita.`)) {
      onDelete(client.id, client.name);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-6 w-6 mr-2 text-muted-foreground" />
            Ficha do Tutor: {client.name}
          </DialogTitle>
          <DialogDescription>
            Detalhes completos sobre {client.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-4 border-primary shadow-lg">
              {client.photoUrl ? (
                <AvatarImage src={client.photoUrl} alt={client.name} />
              ) : (
                <AvatarFallback className="bg-muted text-muted-foreground text-3xl font-bold">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          {/* Removido: Exibição do ID do tutor */}
          {/* <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">ID:</p>
            <p className="col-span-2 text-sm">{client.id}</p>
          </div>
          <Separator /> */}
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Nome:</p>
            <p className="col-span-2 text-sm font-bold">{client.name}</p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">CPF:</p>
            <p className="col-span-2 text-sm flex items-center">
              <IdCard className="h-4 w-4 mr-2 text-muted-foreground" />
              {client.cpf}
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Nascimento:</p>
            <p className="col-span-2 text-sm flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              {client.dateOfBirth && isValid(parseISO(client.dateOfBirth))
                ? format(parseISO(client.dateOfBirth), "dd/MM/yyyy", { locale: ptBR })
                : "N/A"}
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Email:</p>
            <p className="col-span-2 text-sm flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              {client.email}
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">Telefone:</p>
            <p className="col-span-2 text-sm flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              {client.phone}
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-3 items-start gap-4">
            <p className="text-sm font-medium text-muted-foreground">Endereço:</p>
            <p className="col-span-2 text-sm">
              <Home className="h-4 w-4 mr-2 inline-block text-muted-foreground" />
              {client.address.street}, {client.address.number} {client.address.complement}
              <br />
              <MapPin className="h-4 w-4 mr-2 inline-block text-muted-foreground" />
              {client.address.neighborhood}, {client.address.city} - {client.address.state}
              <br />
              <span className="ml-6 text-xs text-muted-foreground">CEP: {client.address.cep}</span>
            </p>
          </div>
          {client.observations && (
            <>
              <Separator />
              <div className="grid grid-cols-3 items-start gap-4">
                <p className="text-sm font-medium text-muted-foreground">Observações:</p>
                <p className="col-span-2 text-sm flex items-center">
                  <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                  {client.observations}
                </p>
              </div>
            </>
          )}
        </div>
        <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <Button variant="outline" onClick={() => onViewPets(client)} className="w-full sm:w-auto mb-2 sm:mb-0 rounded-lg">
            <Dog className="mr-2 h-4 w-4" /> Ver Animais
          </Button>
          <Button variant="outline" onClick={() => onEdit(client)} className="w-full sm:w-auto mb-2 sm:mb-0 rounded-lg">
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>
          <Button variant="destructive" onClick={handleDeleteClick} className="w-full sm:w-auto rounded-lg">
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsDialog;