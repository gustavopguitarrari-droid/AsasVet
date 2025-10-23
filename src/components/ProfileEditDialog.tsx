"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// Removendo importações de componentes de formulário e ícones para simplificar
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { User as UserIcon, Upload } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("E-mail inválido.").min(1, "O e-mail é obrigatório."),
  gender: z.enum(["masculino", "feminino"], {
    required_error: "O gênero é obrigatório.",
  }),
  avatarUrl: z.string().optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof formSchema>;

interface ProfileEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ProfileFormValues;
  onSave: (data: ProfileFormValues) => void;
}

const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
}) => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  // Funções de manipulação de arquivo e watch de avatarUrl removidas para simplificação
  // const avatarUrlWatch = form.watch("avatarUrl");
  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };

  const handleSubmit = (data: ProfileFormValues) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil (Simplificado)</DialogTitle>
          <DialogDescription>
            Este é um teste para verificar a funcionalidade do diálogo.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Conteúdo simplificado do diálogo.</p>
          <p>Nome inicial: {initialData.name}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" onClick={form.handleSubmit(handleSubmit)}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;