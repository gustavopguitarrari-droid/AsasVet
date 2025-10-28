"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Dog, Camera, XCircle, Upload, Search, User } from "lucide-react";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CameraCaptureDialog from "./CameraCaptureDialog";
import { Client, Pet } from "@/types/cadastro";
import { showError, showSuccess } from "@/utils/toast";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/integrations/supabase/client";

// Esquema de validação do formulário com Zod
const formSchema = z.object({
  name: z.string().min(1, "O nome do animal é obrigatório."),
  species: z.enum(["Cachorro", "Gato", "Pássaro", "Roedor", "Peixe", "Outros"], {
    required_error: "A espécie do animal é obrigatória.",
  }),
  breed: z.string().min(1, "A raça é obrigatória."),
  age: z.string().min(1, "A idade é obrigatória."),
  gender: z.enum(["Macho", "Fêmea", "Desconhecido"], {
    required_error: "O sexo é obrigatório.",
  }),
  color: z.string().min(1, "A cor é obrigatória."),
  weight: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0.1, "O peso deve ser um número positivo.").optional()
  ),
  observations: z.string().optional(),
  photoUrl: z.string().optional(), // Pode ser Base64 ou URL pública
  ownerId: z.string().min(1, "O tutor é obrigatório."), // Este campo será preenchido pela busca
  cpfSearch: z.string().optional(), // Campo para input de CPF na UI
});

export type PetFormValues = z.infer<typeof formSchema>;

interface PetFormProps {
  onSubmit: (data: PetFormValues) => void;
  onCancel: () => void;
  initialData?: Pet;
  allClients: Client[]; // Lista de todos os tutores para seleção
  defaultOwnerId?: string; // Para pré-selecionar um tutor
  defaultOwnerName?: string; // Nome do tutor padrão
}

const PetForm: React.FC<PetFormProps> = ({ onSubmit, onCancel, initialData, allClients, defaultOwnerId, defaultOwnerName }) => {
  const { user: appUser } = useUser();
  const userId = appUser?.id;

  const form = useForm<PetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      species: initialData?.species || "Cachorro",
      breed: initialData?.breed || "",
      age: initialData?.age || "",
      gender: initialData?.gender || "Desconhecido",
      color: initialData?.color || "",
      weight: initialData?.weight || undefined,
      observations: initialData?.observations || "",
      ownerId: initialData?.ownerId || defaultOwnerId || "",
      cpfSearch: "", // Inicializa o campo de busca de CPF
    },
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.photoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);

  const [cpfInput, setCpfInput] = useState<string>("");
  const [foundClient, setFoundClient] = useState<Client | null>(null);

  useEffect(() => {
    form.reset({
      name: initialData?.name || "",
      species: initialData?.species || "Cachorro",
      breed: initialData?.breed || "",
      age: initialData?.age || "",
      gender: initialData?.gender || "Desconhecido",
      color: initialData?.color || "",
      weight: initialData?.weight || undefined,
      observations: initialData?.observations || "",
      ownerId: initialData?.ownerId || defaultOwnerId || "",
      cpfSearch: "", // Reseta o campo de busca de CPF
    });
    setPreviewUrl(initialData?.photoUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Lida com os dados iniciais do tutor para edição ou adição a partir da visualização do cliente
    let initialOwner: Client | null = null;
    let initialCpf = "";

    if (initialData?.ownerId) {
      initialOwner = allClients.find(c => c.id === initialData.ownerId) || null;
    } else if (defaultOwnerId) {
      initialOwner = allClients.find(c => c.id === defaultOwnerId) || null;
    }

    if (initialOwner) {
      initialCpf = initialOwner.cpf;
      setFoundClient(initialOwner);
      form.setValue("ownerId", initialOwner.id);
    } else {
      setFoundClient(null);
      form.setValue("ownerId", "");
    }
    setCpfInput(initialCpf);

  }, [initialData, form, allClients, defaultOwnerId, defaultOwnerName]);

  const handleCpfInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Apenas números
    setCpfInput(value);
  };

  const handleSearchCpf = async () => {
    if (!userId) {
      showError("Usuário não autenticado.");
      return;
    }
    const cleanCpf = cpfInput.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      showError("CPF inválido. Digite 11 dígitos.");
      setFoundClient(null);
      form.setValue("ownerId", "");
      return;
    }

    try {
      const { data: foundClientData, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .eq('cpf', cleanCpf)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 significa que nenhuma linha foi encontrada
        throw error;
      }

      if (foundClientData) {
        setFoundClient(foundClientData);
        form.setValue("ownerId", foundClientData.id);
        showSuccess(`Tutor ${foundClientData.name} encontrado!`);
      } else {
        showError("Tutor não encontrado com este CPF.");
        setFoundClient(null);
        form.setValue("ownerId", "");
      }
    } catch (err: any) {
      console.error("Erro ao buscar cliente por CPF:", err.message);
      showError(`Erro ao buscar tutor: ${err.message}`);
      setFoundClient(null);
      form.setValue("ownerId", "");
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
      if (file.size > 2 * 1024 * 1024) { // Limite de 2MB
        showError("A imagem é muito grande. O tamanho máximo permitido é 2MB.");
        setPreviewUrl(initialData?.photoUrl || null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreviewUrl(reader.result);
          form.setValue("photoUrl", reader.result); // Define o Base64 no formulário
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

  const handleCapturePhoto = (imageDataUrl: string) => {
    setPreviewUrl(imageDataUrl);
    form.setValue("photoUrl", imageDataUrl); // Define o Base64 no formulário
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showSuccess("Foto capturada com sucesso!");
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    form.setValue("photoUrl", undefined); // Define como undefined para indicar remoção
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showSuccess("Foto de perfil removida.");
  };

  const currentName = form.watch("name");
  const initials = currentName.charAt(0).toUpperCase() || '';

  const handleSubmit = (data: PetFormValues) => {
    console.log("PetForm (handleSubmit): Dados do formulário sendo submetidos:", data);
    onSubmit(data);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="flex flex-col items-center space-y-4 mb-6">
            <Avatar className="h-24 w-24 border-4 border-primary shadow-lg">
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt="Preview" />
              ) : (
                <AvatarFallback className="bg-muted text-muted-foreground text-3xl font-bold">
                  {initials || <Dog className="h-12 w-12" />}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="pet-picture" className="text-center">Foto do Animal</Label>
              <div className="flex space-x-2">
                <Input
                  id="pet-picture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => setIsCameraDialogOpen(true)}>
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Tirar foto com câmera</span>
                </Button>
              </div>
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

          {/* Busca de Tutor por CPF */}
          <div className="space-y-2 border p-3 rounded-md">
            <Label className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" /> Buscar Tutor por CPF
            </Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Digite o CPF do tutor (somente números)"
                value={cpfInput}
                onChange={handleCpfInputChange}
                maxLength={11}
                className="flex-1"
                disabled={!!defaultOwnerId} // Desabilita se defaultOwnerId for fornecido
              />
              <Button type="button" onClick={handleSearchCpf} size="icon" disabled={!!defaultOwnerId}>
                <Search className="h-4 w-4" />
                <span className="sr-only">Buscar Tutor</span>
              </Button>
            </div>
            {foundClient ? (
              <p className="text-sm text-muted-foreground mt-2">
                Tutor selecionado: <span className="font-semibold">{foundClient.name}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                {defaultOwnerName ? `Tutor padrão: ${defaultOwnerName}` : "Nenhum tutor selecionado."}
              </p>
            )}
            {/* Campo oculto para ownerId, valor definido pela busca ou initialData */}
            <FormField
              control={form.control}
              name="ownerId"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...field} />
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
                <FormLabel>Nome do Animal</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Rex" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="species"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Espécie</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a espécie" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cachorro">Cachorro</SelectItem>
                      <SelectItem value="Gato">Gato</SelectItem>
                      <SelectItem value="Pássaro">Pássaro</SelectItem>
                      <SelectItem value="Roedor">Roedor</SelectItem>
                      <SelectItem value="Peixe">Peixe</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="breed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raça</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Labrador" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idade</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 2 anos, 6 meses" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sexo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o sexo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Macho">Macho</SelectItem>
                      <SelectItem value="Fêmea">Fêmea</SelectItem>
                      <SelectItem value="Desconhecido">Desconhecido</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Dourado, Preto e Branco" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peso (KG)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="Ex: 15.5"
                      {...field}
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações (Opcional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Informações adicionais sobre o animal..." {...field} />
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
              <PlusCircle className="mr-2 h-4 w-4" /> {initialData ? "Salvar Alterações" : "Adicionar Animal"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
      <CameraCaptureDialog
        isOpen={isCameraDialogOpen}
        onClose={() => setIsCameraDialogOpen(false)}
        onCapture={handleCapturePhoto}
      />
    </>
  );
};

export default PetForm;