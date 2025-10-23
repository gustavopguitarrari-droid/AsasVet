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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import BirthdayPicker from "./BirthdayPicker";
import RoleSelect from "./RoleSelect";

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  lastName: z.string().min(1, "O sobrenome é obrigatório."),
  email: z.string().email("E-mail inválido.").min(1, "O e-mail é obrigatório."),
  // gender: z.enum(["masculino", "feminino"], { // Removido
  //   required_error: "O gênero é obrigatório.",
  // }),
  avatarUrl: z.string().optional().or(z.literal("")),
  role: z.string().min(1, "O cargo é obrigatório."),
  birthday: z.date().optional().nullable(),
});

export type ProfileFormValues = z.infer<typeof formSchema>;

interface ProfileEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Omit<ProfileFormValues, "birthday"> & { birthday?: Date | undefined };
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
    defaultValues: {
      ...initialData,
      birthday: initialData.birthday || undefined,
    },
  });

  const avatarUrlWatch = form.watch("avatarUrl");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("avatarUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue("avatarUrl", "");
    }
  };

  const handleSubmit = (data: ProfileFormValues) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Faça alterações no seu perfil aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                {avatarUrlWatch ? (
                  <AvatarImage src={avatarUrlWatch} alt="Avatar do Usuário" />
                ) : (
                  <AvatarFallback className="bg-muted">
                    <UserIcon className="h-12 w-12 text-muted-foreground" />
                  </AvatarFallback>
                )}
              </Avatar>
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Foto de Perfil</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Label htmlFor="avatar-upload" className="flex-1">
                          <Button asChild variant="outline" className="w-full cursor-pointer">
                            <span>
                              <Upload className="mr-2 h-4 w-4" />
                              {avatarUrlWatch ? "Mudar Foto" : "Carregar Foto"}
                            </span>
                          </Button>
                        </Label>
                        {avatarUrlWatch && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => form.setValue("avatarUrl", "")}
                            className="text-destructive hover:text-destructive-foreground"
                          >
                            <UserIcon className="h-4 w-4" />
                            <span className="sr-only">Remover Foto</span>
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sobrenome</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu sobrenome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="seu.email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Gênero removido */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <RoleSelect value={field.value} onValueChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthday"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Aniversário</FormLabel>
                  <BirthdayPicker value={field.value || undefined} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" onClick={onClose} type="button">
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;