"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, User, Mail, Phone, Home, MapPin, Calendar, IdCard, Upload, XCircle } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import MultiSelectPets from "./MultiSelectPets";
import BirthdayPicker from "./BirthdayPicker"; // Importar BirthdayPicker
import { Client, Pet } from "@/types/cadastro";
import { lookupCep } from "@/utils/cepLookup"; // Importar a função de busca de CEP
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Importar Avatar
import { showError, showSuccess } from "@/utils/toast"; // Importar toasts

const formSchema = z.object({
  name: z.string().min(1, "O nome do tutor é obrigatório."),
  email: z.string().email("E-mail inválido.").min(1, "O e-mail é obrigatório."),
  phone: z.string().min(1, "O telefone é obrigatório."),
  cpf: z.string().min(11, "O CPF deve ter 11 dígitos.").max(14, "O CPF deve ter no máximo 14 dígitos (com formatação)."), // Novo campo
  dateOfBirth: z.date({
    required_error: "A data de nascimento é obrigatória.",
  }), // Novo campo
  address: z.object({
    cep: z.string().min(8, "O CEP deve ter 8 dígitos.").max(9, "O CEP deve ter no máximo 9 dígitos (com formatação)."),
    street: z.string().min(1, "A rua é obrigatória."),
    number: z.string().min(1, "O número é obrigatório."),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, "O bairro é obrigatório."),
    city: z.string().min(1, "A cidade é obrigatória."),
    state: z.string().min(2, "O estado é obrigatório.").max(2, "O estado deve ter 2 letras."),
  }),
  photoUrl: z.string().optional(), // Novo campo para URL da foto
  associatedPetIds: z.array(z.string()).optional(),
});

export type ClientFormValues = z.infer<typeof formSchema>;

interface ClientFormProps {
  onSubmit: (data: ClientFormValues) => void;
  onCancel: () => void;
  initialData?: Client & { associatedPetIds?: string[] };
  allPets: Pet[];
}

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, onCancel, initialData, allPets }) => {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      cpf: initialData?.cpf || "",
      dateOfBirth: initialData?.dateOfBirth ? parseISO(initialData.dateOfBirth) : new Date(), // Corrigido aqui
      address: {
        cep: initialData?.address?.cep || "",
        street: initialData?.address?.street || "",
        number: initialData?.address?.number || "",
        complement: initialData?.address?.complement || "",
        neighborhood: initialData?.address?.neighborhood || "",
        city: initialData?.address?.city || "",
        state: initialData?.address?.state || "",
      },
      photoUrl: initialData?.photoUrl || undefined,
      associatedPetIds: initialData?.associatedPetIds || [],
    },
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.photoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value;
    form.setValue("address.cep", cep); // Atualiza o valor do CEP no formulário
    if (cep.replace(/\D/g, '').length === 8) {
      const addressData = await lookupCep(cep);
      if (addressData) {
        form.setValue("address.street", addressData.logradouro);
        form.setValue("address.neighborhood", addressData.bairro);
        form.setValue("address.city", addressData.localidade);
        form.setValue("address.state", addressData.uf);
        showSuccess("Endereço preenchido automaticamente!");
      } else {
        showError("CEP não encontrado ou inválido.");
        form.setValue("address.street", "");
        form.setValue("address.neighborhood", "");
        form.setValue("address.city", "");
        form.setValue("address.state", "");
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError("Por favor, selecione um arquivo de imagem válido.");
        setPreviewUrl(initialData?.photoUrl || null);
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showError("A imagem é muito grande. O tamanho máximo permitido é 2MB.");
        setPreviewUrl(initialData?.photoUrl || null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreviewUrl(reader.result);
          form.setValue("photoUrl", reader.result);
        }
      };
      reader.onerror = () => {
        showError("Erro ao ler o arquivo de imagem.");
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(initialData?.photoUrl || null);
      form.setValue("photoUrl", initialData?.photoUrl || undefined);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    form.setValue("photoUrl", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input
    }
    showSuccess("Foto de perfil removida.");
  };

  const initials = `${form.watch("name").charAt(0)}${form.watch("name").split(' ').pop()?.charAt(0) || ''}`.toUpperCase();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col items-center space-y-4 mb-6">
          <Avatar className="h-24 w-24 border-4 border-primary shadow-lg">
            {previewUrl ? (
              <AvatarImage src={previewUrl} alt="Preview" />
            ) : (
              <AvatarFallback className="bg-muted text-muted-foreground text-3xl font-bold">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="client-picture" className="text-center">Foto do Tutor</Label>
            <Input
              id="client-picture"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            {previewUrl && (
              <Button
                variant="outline"
                className="w-full mt-2 text-destructive hover:bg-destructive/10"
                onClick={handleRemovePhoto}
              >
                <XCircle className="h-4 w-4 mr-2" /> Remover Foto
              </Button>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: João Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 123.456.789-00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data de Nascimento</FormLabel>
              <FormControl>
                <BirthdayPicker
                  value={field.value}
                  onChange={field.onChange}
                />
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
                <Input type="email" placeholder="Ex: joao.silva@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="Ex: (XX) XXXXX-XXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h3 className="text-lg font-semibold mt-6 mb-4 flex items-center">
          <Home className="h-5 w-5 mr-2 text-muted-foreground" /> Endereço
        </h3>
        <FormField
          control={form.control}
          name="address.cep"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 12345-678" {...field} onChange={handleCepChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address.street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rua</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Rua das Flores" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="address.number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.complement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complemento (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Apt 101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address.neighborhood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Centro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="address.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: São Paulo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado (UF)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: SP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-4 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-muted-foreground" /> Animais Associados
        </h3>
        <FormField
          control={form.control}
          name="associatedPetIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Animais Associados</FormLabel>
              <FormControl>
                <MultiSelectPets
                  allPets={allPets}
                  selectedPetIds={field.value || []}
                  onValueChange={field.onChange}
                  placeholder="Selecione os animais deste tutor"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            <PlusCircle className="mr-2 h-4 w-4" /> {initialData ? "Salvar Alterações" : "Adicionar Tutor"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ClientForm;