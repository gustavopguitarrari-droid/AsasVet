"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, User as UserIcon, Mail, Phone, Briefcase, IdCard, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import RoleSelect from "@/components/RoleSelect"; // Reutilizando o RoleSelect

const formSchema = z.object({
  firstName: z.string().min(1, "O nome é obrigatório."),
  lastName: z.string().min(1, "O sobrenome é obrigatório."),
  email: z.string().email("E-mail inválido.").min(1, "O e-mail é obrigatório."),
  phone: z.string().optional(),
  crmv: z.string().optional(),
  role: z.string().min(1, "O cargo é obrigatório."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres.").optional(), // Opcional para edição
});

export type TeamMemberFormValues = z.infer<typeof formSchema>;

interface TeamMemberFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TeamMemberFormValues) => void;
  initialData?: TeamMemberFormValues & { id: string }; // Inclui ID para edição
  isSubmitting: boolean;
}

const TeamMemberFormDialog: React.FC<TeamMemberFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      crmv: initialData?.crmv || "",
      role: initialData?.role || "Veterinário",
      password: "", // Senha não é preenchida em edição
    },
  });

  // Se estiver em modo de edição, a senha não é obrigatória
  React.useEffect(() => {
    if (initialData) {
      form.unregister("password"); // Remove a validação de senha para edição
    } else {
      form.register("password", { required: "A senha é obrigatória para novos usuários." });
    }
  }, [initialData, form]);

  const handleSubmit = (data: TeamMemberFormValues) => {
    // Remove a senha se estiver vazia e em modo de edição
    const dataToSubmit = { ...data };
    if (initialData && !dataToSubmit.password) {
      delete dataToSubmit.password;
    }
    onSubmit(dataToSubmit);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {initialData ? (
              <>
                <UserIcon className="h-5 w-5 mr-2" /> Editar Membro da Equipe
              </>
            ) : (
              <>
                <PlusCircle className="h-5 w-5 mr-2" /> Adicionar Novo Membro
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Atualize os detalhes do membro da equipe."
              : "Preencha os dados para adicionar um novo membro à sua equipe."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" /> Nome
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Primeiro Nome" {...field} />
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
                    <FormLabel className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" /> Sobrenome
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Sobrenome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" /> E-mail
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!initialData && ( // Campo de senha apenas para novos usuários
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <IdCard className="h-4 w-4 mr-2 text-muted-foreground" /> Senha
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" /> Telefone (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="crmv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" /> CRMV (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="CRMV-XX 12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" /> Cargo
                  </FormLabel>
                  <FormControl>
                    <RoleSelect
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={onClose} type="button" disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Salvando..."
                ) : initialData ? (
                  "Salvar Alterações"
                ) : (
                  "Adicionar Membro"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberFormDialog;