"use client";

import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FileText, Download, X } from 'lucide-react';
import { Appointment } from '@/pages/Appointments';
import { MedicalRecordFormValues } from '@/components/consultation/MedicalRecordForm';
import { generateMedicalRecordPdf } from '@/utils/generateMedicalRecordPdf';
import { useUser } from '@/context/UserContext'; // Importar useUser para o logo

const formSchema = z.object({
  filename: z.string().min(1, "O nome do arquivo é obrigatório."),
});

type PdfDownloadFormValues = z.infer<typeof formSchema>;

interface PdfDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  medicalRecord: MedicalRecordFormValues;
}

const PdfDownloadDialog: React.FC<PdfDownloadDialogProps> = ({
  isOpen,
  onClose,
  appointment,
  medicalRecord,
}) => {
  const { user: appUser } = useUser(); // Obter o usuário para o logo
  const defaultFilename = `Prontuario_${appointment.pet_name}_${format(parseISO(appointment.date), 'yyyyMMdd')}.pdf`;

  const form = useForm<PdfDownloadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      filename: defaultFilename,
    },
  });

  const handleDownload = async (data: PdfDownloadFormValues) => {
    try {
      await generateMedicalRecordPdf({
        appointment,
        medicalRecord,
        logoUrl: appUser?.logoUrl, // Passar o logoUrl
        filename: data.filename,
      });
      onClose();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      // Poderia adicionar um toast de erro aqui
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" /> Baixar Prontuário Médico
          </DialogTitle>
          <DialogDescription>
            Defina o nome do arquivo para o prontuário de <span className="font-semibold">{appointment.pet_name}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleDownload)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="filename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Arquivo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do arquivo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" onClick={onClose} type="button">
                <X className="h-4 w-4 mr-2" /> Cancelar
              </Button>
              <Button type="submit">
                <Download className="h-4 w-4 mr-2" /> Baixar PDF
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PdfDownloadDialog;