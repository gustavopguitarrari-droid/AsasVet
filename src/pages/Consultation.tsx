"use client";

import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, User, PawPrint, Stethoscope, CalendarCheck, CheckCircle, ClipboardList, Hospital, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { showError, showSuccess } from '@/utils/toast';
import { format, parseISO, differenceInSeconds, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AppointmentChronometer from '@/components/AppointmentChronometer';
import { Appointment } from './Appointments';
import MedicalRecordForm, { MedicalRecordFormValues, MedicalRecordFormInstance } from '@/components/consultation/MedicalRecordForm';
import ForwardToInternmentDialog from '@/components/ForwardToInternmentDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf';
import { uploadRecipePdfToSupabase, deleteRecipePdfFromSupabase } from '@/utils/supabaseStorage';
import PdfPreviewDialog from '@/components/PdfPreviewDialog';

// Interface para o prontuário médico (deve corresponder à tabela medical_records)
interface MedicalRecord {
  id: string;
  appointment_id: string;
  user_id: string;
  anamnesis?: string | null;
  physical_exam?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  prescriptions?: { medication: string; dosage: string; frequency: string; instructions?: string }[] | null; // Alterado para permitir null
  recipe_pdf_url?: string | null;
  created_at: string;
  updated_at: string;
}

const ConsultationPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;

  const [isForwardToInternmentDialogOpen, setIsForwardToInternmentDialogOpen] = React.useState(false);
  const [isFinalizeConfirmDialogOpen, setIsFinalizeConfirmDialogOpen] = useState(false);

  const medicalRecordFormRef = useRef<MedicalRecordFormInstance>(null);
  const [isMedicalRecordFormValid, setIsMedicalRecordFormValid] = useState(false);
  const [isAttemptingFinalize, setIsAttemptingFinalize] = useState(false);

  const [isRecipePdfPreviewDialogOpen, setIsRecipePdfPreviewDialogOpen] = useState(false);
  const [recipePdfBlob, setRecipePdfBlob] = useState<Blob | null>(null);
  const [recipePdfFilename, setRecipePdfFilename] = useState("");

  // Query para buscar os detalhes da consulta
  const { data: appointment, isLoading, error } = useQuery<Appointment>({
    queryKey: ['appointment', appointmentId, userId],
    queryFn: async () => {
      if (!userId || !appointmentId) throw new Error("User or Appointment ID not available.");
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!appointmentId,
  });

  // Query para buscar o prontuário médico da consulta
  const { data: medicalRecord, isLoading: isLoadingMedicalRecord, error: medicalRecordError } = useQuery<MedicalRecord | null>({
    queryKey: ['medicalRecord', appointmentId, userId],
    queryFn: async () => {
      if (!userId || !appointmentId) throw new Error("User or Appointment ID not available.");
      const { data, error } = await supabase
        .from('medical_records')
        .select('id, appointment_id, user_id, anamnesis, physical_exam, diagnosis, treatment, prescriptions, recipe_pdf_url, created_at, updated_at')
        .eq('appointment_id', appointmentId)
        .eq('user_id', userId)
        .maybeSingle(); // ALTERADO: Usando .maybeSingle() aqui
      if (error) {
        console.error("ConsultationPage: Error fetching medical record:", error);
        throw error;
      }
      if (!data) {
        console.log("ConsultationPage: No medical record found for appointment", appointmentId, ". Returning null.");
        return null;
      }
      console.log("ConsultationPage: Raw medical record data from Supabase:", data);
      // Garante que prescriptions seja sempre um array
      return {
        ...data,
        prescriptions: data.prescriptions || [],
      } as MedicalRecord;
    },
    enabled: !!userId && !!appointmentId,
  });

  // Mutação para salvar/atualizar o prontuário médico
  const saveMedicalRecordMutation = useMutation({
    mutationFn: async (recordData: MedicalRecordFormValues & { recipe_pdf_url?: string | null }) => {
      if (!userId || !appointmentId) throw new Error("User or Appointment ID not available.");

      const payload = {
        user_id: userId,
        appointment_id: appointmentId,
        anamnesis: recordData.anamnesis || null,
        physical_exam: recordData.physicalExam || null,
        diagnosis: recordData.diagnosis || null,
        treatment: recordData.treatment || null,
        prescriptions: recordData.prescriptions && recordData.prescriptions.length > 0 ? recordData.prescriptions : [],
        recipe_pdf_url: recordData.recipe_pdf_url || null,
      };

      console.log("ConsultationPage: Payload being sent to medical_records:", JSON.stringify(payload, null, 2)); // Adicionado log aqui

      if (medicalRecord?.id) {
        const { data, error } = await supabase
          .from('medical_records')
          .update(payload)
          .eq('id', medicalRecord.id)
          .eq('user_id', userId)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('medical_records')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecord', appointmentId, userId] });
      showSuccess("Prontuário salvo com sucesso!");
      if (isAttemptingFinalize) {
        finalizeAppointmentMutation.mutate(appointmentId!);
      }
      setIsAttemptingFinalize(false);
    },
    onError: (err) => {
      console.error("Error saving medical record:", err);
      showError(`Erro ao salvar prontuário: ${err.message}`);
      setIsAttemptingFinalize(false);
    },
  });

  // Mutação para finalizar a consulta
  const finalizeAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error("User not authenticated.");
      const now = new Date();
      const { data, error } = await supabase
        .from('appointments')
        .update({
          status: "Realizada",
          completion_timestamp: now.toISOString(),
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
      queryClient.invalidateQueries({ queryKey: ['historyAppointments', userId] });
      showSuccess("Consulta finalizada com sucesso!");
      navigate('/consultas');
    },
    onError: (err) => {
      showError(`Erro ao finalizar consulta: ${err.message}`);
    },
  });

  // NOVO: Mutação para gerar e salvar o PDF da receita
  const generateAndSaveRecipePdfMutation = useMutation({
    mutationFn: async (prescriptions: MedicalRecordFormValues['prescriptions']) => {
      console.log("generateAndSaveRecipePdfMutation: Iniciando...");
      if (!userId || !appointmentId || !appointment) {
        console.error("generateAndSaveRecipePdfMutation: Dados da consulta ou usuário não disponíveis.");
        throw new Error("Dados da consulta ou usuário não disponíveis.");
      }
      if (!prescriptions || prescriptions.length === 0) {
        console.error("generateAndSaveRecipePdfMutation: Nenhuma prescrição para gerar a receita.");
        throw new Error("Nenhuma prescrição para gerar a receita.");
      }

      const clinicDetails = {
        companyName: appUser?.companyName || 'AsasVet',
        address: `${appUser?.addressStreet || ''}, ${appUser?.addressNumber || ''} ${appUser?.addressComplement || ''} - ${appUser?.addressNeighborhood || ''}, ${appUser?.addressCity || ''} - ${appUser?.addressState || ''} ${appUser?.addressCep || ''}`,
        phone: appUser?.phone || '',
        email: appUser?.email || '',
        veterinarianCrmv: appUser?.crmv || '',
        veterinarianName: `${appUser?.name || ''} ${appUser?.lastName || ''}`,
      };

      let currentMedicalRecordId = medicalRecord?.id;
      console.log("generateAndSaveRecipePdfMutation: medicalRecord?.id inicial:", currentMedicalRecordId);

      if (!currentMedicalRecordId) {
        console.log("ConsultationPage: generateAndSaveRecipePdfMutation - No existing medical record found, creating a new one for recipe PDF.");
        const { data: newRecord, error: insertRecordError } = await supabase
          .from('medical_records')
          .insert({
            user_id: userId,
            appointment_id: appointmentId,
            anamnesis: null,
            physical_exam: null,
            diagnosis: null,
            treatment: null,
            prescriptions: [],
          })
          .select('id')
          .single();

        if (insertRecordError || !newRecord) {
          console.error("generateAndSaveRecipePdfMutation: Erro ao criar novo prontuário:", insertRecordError);
          throw insertRecordError || new Error("Failed to create a new medical record for recipe PDF.");
        }
        currentMedicalRecordId = newRecord.id;
        console.log("ConsultationPage: generateAndSaveRecipePdfMutation - New medical record created with ID:", currentMedicalRecordId);
        queryClient.invalidateQueries({ queryKey: ['medicalRecord', appointmentId, userId] });
      }

      const { data: existingRecipePdfUrlData, error: fetchPdfUrlError } = await supabase
        .from('medical_records')
        .select('recipe_pdf_url')
        .eq('id', currentMedicalRecordId)
        .maybeSingle(); // ALTERADO: Usando .maybeSingle() aqui

      if (fetchPdfUrlError) {
        console.warn("ConsultationPage: generateAndSaveRecipePdfMutation - Failed to fetch existing recipe_pdf_url for medical record ID:", currentMedicalRecordId, fetchPdfUrlError);
      } else if (existingRecipePdfUrlData?.recipe_pdf_url) {
        console.log("ConsultationPage: generateAndSaveRecipePdfMutation - Existing recipe PDF found, attempting to delete:", existingRecipePdfUrlData.recipe_pdf_url);
        await deleteRecipePdfFromSupabase(existingRecipePdfUrlData.recipe_pdf_url);
      }

      console.log("generateAndSaveRecipePdfMutation: Gerando PDF da receita...");
      const pdfBlob = await generatePrescriptionPdf({
        appointment,
        prescriptions,
        logoUrl: appUser?.logoUrl,
        clinicDetails,
      });
      console.log("generateAndSaveRecipePdfMutation: PDF Blob gerado:", pdfBlob);

      console.log("generateAndSaveRecipePdfMutation: Fazendo upload do PDF para o Supabase Storage...");
      const newPdfUrl = await uploadRecipePdfToSupabase(pdfBlob, userId, appointmentId);
      console.log("ConsultationPage: generateAndSaveRecipePdfMutation - Uploaded new PDF to URL:", newPdfUrl);

      if (!newPdfUrl) {
        console.error("generateAndSaveRecipePdfMutation: Falha ao fazer upload do PDF da receita.");
        throw new Error("Falha ao fazer upload do PDF da receita.");
      }

      console.log("generateAndSaveRecipePdfMutation: Atualizando medical_records com a nova URL e prescrições...");
      const { data, error } = await supabase
        .from('medical_records')
        .update({ recipe_pdf_url: newPdfUrl, prescriptions: prescriptions })
        .eq('id', currentMedicalRecordId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error("generateAndSaveRecipePdfMutation: Erro ao atualizar medical_records:", error);
        throw error;
      }
      console.log("ConsultationPage: generateAndSaveRecipePdfMutation - Medical record updated with new recipe_pdf_url:", data.recipe_pdf_url);
      return { pdfBlob, newPdfUrl };
    },
    onSuccess: ({ pdfBlob, newPdfUrl }) => {
      console.log("generateAndSaveRecipePdfMutation: onSuccess - Invalidando queries e mostrando sucesso.");
      queryClient.invalidateQueries({ queryKey: ['medicalRecord', appointmentId, userId] });
      // NOVO: Invalidar as queries de agendamentos e histórico
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
      queryClient.invalidateQueries({ queryKey: ['historyAppointments', userId] });
      showSuccess("Receita PDF gerada e salva com sucesso!");
      setRecipePdfBlob(pdfBlob);
      setRecipePdfFilename(`Receita_${appointment?.pet_name}_${format(parseISO(appointment?.date || new Date().toISOString()), 'yyyyMMdd')}.pdf`);
      setIsRecipePdfPreviewDialogOpen(true);
    },
    onError: (err: any) => {
      console.error("ConsultationPage: generateAndSaveRecipePdfMutation - Erro ao gerar e salvar PDF da receita:", err);
      showError(`Erro ao gerar receita: ${err.message || "Erro desconhecido"}`);
    },
  });

  const handleFinalizeConsultationClick = () => {
    setIsFinalizeConfirmDialogOpen(true);
  };

  const handleConfirmFinalize = async () => {
    setIsAttemptingFinalize(true);
    setIsFinalizeConfirmDialogOpen(false);

    const isValid = await medicalRecordFormRef.current?.trigger();
    if (isValid) {
      medicalRecordFormRef.current?.handleSubmit(handleSaveMedicalRecord)();
    } else {
      showError("Por favor, preencha todos os campos obrigatórios do prontuário antes de finalizar.");
      setIsAttemptingFinalize(false);
    }
  };

  const handleSaveMedicalRecord = (data: MedicalRecordFormValues) => {
    saveMedicalRecordMutation.mutate(data);
  };

  const handleGenerateRecipePdf = (prescriptions: MedicalRecordFormValues['prescriptions']) => {
    generateAndSaveRecipePdfMutation.mutate(prescriptions);
  };

  const handleConfirmRecipePdfDownload = (filename: string) => {
    if (recipePdfBlob) {
      const url = URL.createObjectURL(recipePdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess("PDF da receita baixado com sucesso!");
      setIsRecipePdfPreviewDialogOpen(false);
    }
  };

  if (isLoading || isLoadingMedicalRecord) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando detalhes da consulta...</p>
      </div>
    );
  }

  if (error || medicalRecordError) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Erro ao carregar consulta: {error?.message || medicalRecordError?.message}</p>
        <Button onClick={() => navigate('/consultas')} className="ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Consultas
        </Button>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Consulta não encontrada.</p>
        <Button onClick={() => navigate('/consultas')} className="ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Consultas
        </Button>
      </div>
    );
  }

  const initialMedicalRecordData: MedicalRecordFormValues = {
    anamnesis: medicalRecord?.anamnesis || undefined,
    physicalExam: medicalRecord?.physical_exam || undefined,
    diagnosis: medicalRecord?.diagnosis || undefined,
    treatment: medicalRecord?.treatment || undefined,
    prescriptions: medicalRecord?.prescriptions || [],
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center">
          <CalendarCheck className="mr-3 h-7 w-7 text-primary" /> Consulta em Andamento
        </h2>
        <Button onClick={() => navigate('/consultas')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Consultas
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">{appointment.service}</CardTitle>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
            {appointment.start_time && <AppointmentChronometer startTime={appointment.start_time} />}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 py-4">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="text-lg font-medium">Tutor: <span className="font-semibold">{appointment.client_name}</span></p>
          </div>
          <div className="flex items-center">
            <PawPrint className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="text-lg font-medium">Animal: <span className="font-semibold">{appointment.pet_name} ({appointment.species})</span></p>
          </div>
          <div className="flex items-center">
            <Stethoscope className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="text-lg font-medium">Veterinário: <span className="font-semibold">{appointment.veterinarian}</span></p>
          </div>
          <div className="flex items-center">
            <CalendarCheck className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="text-lg font-medium">Data: <span className="font-semibold">{format(parseISO(appointment.date), "dd/MM/yyyy", { locale: ptBR })}</span></p>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="text-lg font-medium">Hora: <span className="font-semibold">{appointment.time}</span></p>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Prontuário Médico */}
      <MedicalRecordForm
        initialData={initialMedicalRecordData}
        onSubmit={handleSaveMedicalRecord}
        isSubmitting={saveMedicalRecordMutation.isPending}
        formRef={medicalRecordFormRef}
        onValidationChange={setIsMedicalRecordFormValid}
        onGenerateRecipePdf={handleGenerateRecipePdf}
      />

      <div className="flex justify-end space-x-2">
        <Button onClick={() => setIsForwardToInternmentDialogOpen(true)} variant="secondary" disabled={!appointment}>
          <Hospital className="mr-2 h-4 w-4" /> Encaminhar para Internação
        </Button>
        <AlertDialog open={isFinalizeConfirmDialogOpen} onOpenChange={setIsFinalizeConfirmDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              onClick={handleFinalizeConsultationClick}
              disabled={!isMedicalRecordFormValid || finalizeAppointmentMutation.isPending || saveMedicalRecordMutation.isPending || isAttemptingFinalize}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              {finalizeAppointmentMutation.isPending || isAttemptingFinalize ? "Finalizando..." : "Finalizar Consulta"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" /> Confirmar Finalização da Consulta
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Uma vez finalizada, a consulta será movida para o histórico.
                <br /><br />
                Você revisou todo o prontuário médico e confirmou que todas as informações estão corretas e completas?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={finalizeAppointmentMutation.isPending || saveMedicalRecordMutation.isPending || isAttemptingFinalize}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmFinalize}
                disabled={finalizeAppointmentMutation.isPending || saveMedicalRecordMutation.isPending || isAttemptingFinalize}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {finalizeAppointmentMutation.isPending || isAttemptingFinalize ? "Sim, Finalizar Consulta" : "Sim, Finalizar Consulta"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {appointment && (
        <ForwardToInternmentDialog
          isOpen={isForwardToInternmentDialogOpen}
          onClose={() => setIsForwardToInternmentDialogOpen(false)}
          appointment={appointment}
        />
      )}

      <PdfPreviewDialog
        isOpen={isRecipePdfPreviewDialogOpen}
        onClose={() => setIsRecipePdfPreviewDialogOpen(false)}
        pdfBlob={recipePdfBlob}
        filename={recipePdfFilename}
        onConfirmDownload={handleConfirmRecipePdfDownload}
      />
    </div>
  );
};

export default ConsultationPage;