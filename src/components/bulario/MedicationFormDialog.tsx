"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Pill, Factory, Dog, Cat, Upload, XCircle, Image as ImageIcon } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { showError } from "@/utils/toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  active_principle: z.string().min(1, "O princípio ativo é obrigatório."),
  manufacturer: z.string().min(1, "O fabricante é obrigatório."),
  indications: z.string().min(1, "As indicações são obrigatórias."),
  contraindications: z.string().min(1, "As contraindicações são obrigatórias."),
  dosage: z.object({
    dogs: z.string().min(1, "A posologia para cães é obrigatória."),
    cats: z.string().min(1, "A posologia para gatos é obrigatória."),
  }),
  presentations: z.string().min(1, "Informe as apresentações, separadas por vírgula."),
  photo_url: z.string().optional(), // Base64 or existing URL
});

export type MedicationFormValues = z.infer<typeof formSchema>;

interface MedicationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MedicationFormValues) => void;
  isSubmitting: boolean;
  initialData?: MedicationFormValues & { id?: string; presentations: string[] };
}

const MedicationFormDialog: React.FC<MedicationFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
}) => {
  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      active_principle: initialData?.active_principle || "",
      manufacturer: initialData?.manufacturer || "",
      indications: initialData?.indications || "",
      contraindications: initialData?.contraindications || "",
      dosage: {
        dogs: initialData?.dosage?.dogs || "",
        cats: initialData?.dosage?.cats || "",
      },
      presentations: Array.isArray(initialData?.presentations) ? initialData.presentations.join(', ') : "",
      photo_url: initialData?.photo_url || undefined,
    },
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.photo_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: initialData?.name || "",
        active_principle: initialData?.active_principle || "",
        manufacturer: initialData?.manufacturer || "",
        indications: initialData?.indications || "",
        contraindications: initialData?.contraindications || "",
        dosage: {
          dogs: initialData?.dosage?.dogs || "",
          cats: initialData?.dosage?.cats || "",
        },
        presentations: Array.isArray(initialData?.presentations) ? initialData.presentations.join(', ') : "",
        photo_url: initialData?.photo_url || undefined,
      });
      setPreviewUrl(initialData?.photo_url || null);
    }
  }, [isOpen, initialData, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError("Por favor, selecione um arquivo de imagem válido.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showError("A imagem é muito grande. O tamanho máximo permitido é 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreviewUrl(reader.result);
          form.setValue("photo_url", reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPreviewUrl(null);
    form.setValue("photo_url", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Pill className="h-5 w-5 mr-2" /> {initialData ? "Editar Medicamento" : "Adicionar Novo Medicamento"}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes do medicamento.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Avatar className="h-32 w-32 border-4 border-primary shadow-lg">
                {previewUrl ? (
                  <AvatarImage src={previewUrl} alt="Preview" />
                ) : (
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <ImageIcon className="h-16 w-16" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="medication-photo">Foto do Medicamento</Label>
                <Input
                  id="medication-photo"
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
                  <FormLabel>Nome do Medicamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Anti-inflamatório Pet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active_principle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Princípio Ativo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Meloxicam" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fabricante</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: VetPharma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="indications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indicações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição das indicações de uso..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contraindications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraindicações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição das contraindicações..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dosage.dogs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Dog className="h-4 w-4 mr-2" /> Posologia - Cães</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Dosagem recomendada para cães..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dosage.cats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Cat className="h-4 w-4 mr-2" /> Posologia - Gatos</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Dosagem recomendada para gatos..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="presentations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apresentações</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Comprimidos 10mg, Suspensão Oral 50ml" {...field} />
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
                <PlusCircle className="mr-2 h-4 w-4" />
                {isSubmitting ? "Salvando..." : (initialData ? "Salvar Alterações" : "Adicionar Medicamento")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MedicationFormDialog;