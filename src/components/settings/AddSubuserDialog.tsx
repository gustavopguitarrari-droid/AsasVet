"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, User as UserIcon, Mail, Lock, Briefcase } from "lucide-react";

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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RoleSelect from "@/components/RoleSelect";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

const formSchema = z.object({
  firstName: z.string().min(1, "O nome é obrigatório."),
  lastName: z.string().min(1, "O sobrenome é obrigatório."),
  email: z.string().email("E-mail inválido.").min(1, "O e-mail é obrigatório."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  role: z.string().min(1, "O cargo é obrigatório."),
  // Gênero removido
});

export type SubuserFormValues = z.infer<typeof formSchema>;

interface AddSubuserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubuserCreated: () => void; // Callback para invalidar queries no componente pai
}

const AddSubuserDialog: React.FC<AddSubuserDialogProps> = ({ isOpen, onClose, onSubuserCreated }) => {
  const queryClient = useQueryClient();
  const form = useForm<SubuserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "Veterinário", // Definido como 'Veterinário' por padrão
      // Gênero removido
    },
  });

  const createSubuserMutation = useMutation({
    mutationFn: async (newUserData: SubuserFormValues) => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) throw new Error("User not authenticated.");

      const { data: responseData, error } = await supabase.functions.invoke('create-subuser', {
        body: JSON.stringify({
          email: newUserData.email,
          password: newUserData.password,
          first_name: newUserData.firstName,
          last_name: newUserData.lastName,
          role: newUserData.role,
          // Gênero removido do body
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
      });

      if (error) throw new Error(error.message);
      if (responseData.error) throw new Error(responseData.error);
      return responseData;
    },
    onSuccess: () => {
      onSubuserCreated(); // Chamar o callback para invalidar queries no pai
      showSuccess("Subusuário criado com sucesso!");
      form.reset();
      onClose(); // Fechar o diálogo após sucesso
    },
    onError: (err: any) => {
      console.error("Erro ao criar subusuário:", err.message);
      showError(`Erro ao criar subusuário: ${err.message}`);
    },
  });

  const handleSubmit = (data: SubuserFormValues) => {
    createSubuserMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <PlusCircle className="h-5 w-5 mr-2" /> Criar Novo Subusuário
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para adicionar um novo membro à sua equipe.
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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-muted-foreground" /> Senha
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Gênero removido */}
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
              <Button variant="outline" onClick={onClose} type="button">
                Cancelar
              </Button>
              <Button type="submit" disabled={createSubuserMutation.isPending}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {createSubuserMutation.isPending ? "Criando..." : "Criar Subusuário"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubuserDialog;