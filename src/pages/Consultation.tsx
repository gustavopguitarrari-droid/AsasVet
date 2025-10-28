"use client";

import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, User, PawPrint, Stethoscope, CalendarCheck, CheckCircle, ClipboardList, Hospital, AlertTriangle } from 'lucide-react'; // Adicionado Hospital e AlertTriangle
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { showError, showSuccess } from '@/utils/toast';
import { format, parseISO, differenceInSeconds, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AppointmentChronometer from '@/components/AppointmentChronometer';
import { Appointment } from './Appointments'; // Importar a interface Appointment
import MedicalRecordForm, { MedicalRecordFormValues, MedicalRecordFormInstance } from '@/components/consultation/MedicalRecordForm'; // Importar o novo formulário e a interface da instância
import ForwardToInternmentDialog from '@/components/ForwardToInternmentDialog'; // NOVO: Importar o diálogo de encaminhamento
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
} from "@/components/ui/alert-dialog"; // Importar AlertDialog
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf'; // NOVO: Importar função de PDF de receita
import { uploadRecipePdfToSupabase, deleteRecipePdfFromSupabase } from '@/utils/supabaseStorage'; // NOVO: Funções de storage para receita
import PdfPreviewDialog from '@/components/PdfPreviewDialog'; // NOVO: Diálogo de pré-visualização de PDF

// Interface para o prontuário médico (deve corresponder à tabela medical_records)
interface MedicalRecord {
  id: string;
  appointment_id: string;
  user_id: string;
  anamnesis?: string | null;
  physical_exam?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  prescriptions?: { medication: string; dosage: string; frequency: string; instructions?: string }[] | null;
  recipe_pdf_url?: string | null; // NOVO: URL do PDF da receita
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
  const [isFinalizeConfirmDialogOpen, setIsFinalizeConfirmDialogOpen] = useState(false); // Novo estado para o diálogo de confirmação

  // Ref para acessar a instância do formulário MedicalRecordForm
  const medicalRecordFormRef = useRef<MedicalRecordFormInstance>(null);
  const [isMedicalRecordFormValid, setIsMedicalRecordFormValid] = useState(false);
  const [isAttemptingFinalize, setIsAttemptingFinalize] = useState(false);

  // Estados para o diálogo de pré-visualização de PDF de receita
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
  const { data: medicalRecord, isLoading: isLoadingMedicalRecord, error: medicalRecordError } = useQuery<MedicalRecord>({
    queryKey: ['medicalRecord', appointmentId, userId],
    queryFn: async () => {
      if (!userId || !appointmentId) throw new Error("User or Appointment ID not available.");
      const { data, error } = await supabase
        .from('medical_records')
        .select('id, appointment_id, user_id, anamnesis, physical_exam, diagnosis, treatment, prescriptions, recipe_pdf_url, created_at, updated_at') // Seleção explícita com recipe_pdf_url
        .eq('appointment_id', appointmentId)
        .eq('user_id', userId)
        .single();
      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return null; // Retorna null se não houver prontuário
        }
        throw error;
      }
      return data;
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
        prescriptions: recordData.prescriptions && recordData.prescriptions.length > 0 ? recordData.prescriptions : null,
        recipe_pdf_url: recordData.recipe_pdf_url || null, // Incluir recipe_pdf_url no payload
      };

      console.log("Payload being sent to medical_records:", JSON.stringify(payload, null, 2)); // Log para depuração

      if (medicalRecord?.id) {
        // Update existing record
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
        // Insert new record
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
        // Se a intenção era finalizar, agora que o prontuário foi salvo, finalize a consulta
        finalizeAppointmentMutation.mutate(appointmentId!);
      }
      setIsAttemptingFinalize(false); // Resetar o estado de tentativa de finalização
    },
    onError: (err) => {
      console.error("Error saving medical record:", err); // Log detalhado do erro
      showError(`Erro ao salvar prontuário: ${err.message}`);
      setIsAttemptingFinalize(false); // Resetar o estado de tentativa de finalização em caso de erro
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
          completion_timestamp: now.toISOString(), // Salvar como ISO string (UTC)
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
      navigate('/consultas'); // Redireciona de volta para a lista de consultas
    },
    onError: (err) => {
      showError(`Erro ao finalizar consulta: ${err.message}`);
    },
  });

  // NOVO: Mutação para gerar e salvar o PDF da receita
  const generateAndSaveRecipePdfMutation = useMutation({
    mutationFn: async (prescriptions: MedicalRecordFormValues['prescriptions']) => {
      if (!userId || !appointmentId || !appointment) throw new Error("Dados da consulta ou usuário não disponíveis.");
      if (!prescriptions || prescriptions.length === 0) throw new Error("Nenhuma prescrição para gerar a receita.");

      const clinicDetails = {
        companyName: appUser?.companyName || 'AsasVet',
        address: `${appUser?.addressStreet || ''}, ${appUser?.addressNumber || ''} ${appUser?.addressComplement || ''} - ${appUser?.addressNeighborhood || ''}, ${appUser?.addressCity || ''} - ${appUser?.addressState || ''} ${appUser?.addressCep || ''}`,
        phone: appUser?.phone || '',
        email: appUser?.email || '',
        veterinarianCrmv: appUser?.crmv || '',
        veterinarianName: `${appUser?.name || ''} ${appUser?.lastName || ''}`,
      };

      const pdfBlob = await generatePrescriptionPdf({
        appointment,
        prescriptions,
        logoUrl: appUser?.logoUrl,
        clinicDetails,
      });

      // Delete old PDF if exists
      if (medicalRecord?.recipe_pdf_url) {
        await deleteRecipePdfFromSupabase(medicalRecord.recipe_pdf_url);
      }

      const newPdfUrl = await uploadRecipePdfToSupabase(pdfBlob, userId, appointmentId);

      if (!newPdfUrl) throw new Error("Falha ao fazer upload do PDF da receita.");

      // Update medical record with new PDF URL
      const { data, error } = await supabase
        .from('medical_records')
        .update({ recipe_pdf_url: newPdfUrl })
        .eq('id', medicalRecord?.id || '') // Use existing medicalRecord ID or throw error if not found
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { pdfBlob, newPdfUrl };
    },
    onSuccess: ({ pdfBlob, newPdfUrl }) => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecord', appointmentId, userId] });
      showSuccess("Receita PDF gerada e salva com sucesso!");
      setRecipePdfBlob(pdfBlob);
      setRecipePdfFilename(`Receita_${appointment?.pet_name}_${format(parseISO(appointment?.date || new Date().toISOString()), 'yyyyMMdd')}.pdf`);
      setIsRecipePdfPreviewDialogOpen(true);
    },
    onError: (err: any) => {
      console.error("Erro ao gerar e salvar PDF da receita:", err);
      showError(`Erro ao gerar receita: ${err.message || "Erro desconhecido"}`);
    },
  });

  // Função para lidar com o clique no botão "Finalizar Consulta"
  const handleFinalizeConsultationClick = () => {
    setIsFinalizeConfirmDialogOpen(true); // Abre o diálogo de confirmação
  };

  // Nova função que será chamada após a confirmação no AlertDialog
  const handleConfirmFinalize = async () => {
    setIsAttemptingFinalize(true);
    setIsFinalizeConfirmDialogOpen(false); // Fecha o diálogo de confirmação

    const isValid = await medicalRecordFormRef.current?.trigger(); // Disparar validação do formulário
    if (isValid) {
      // Se o formulário é válido, submeta-o. O onSuccess da mutação de salvar prontuário
      // verificará isAttemptingFinalize e chamará finalizeAppointmentMutation.
      medicalRecordFormRef.current?.handleSubmit(handleSaveMedicalRecord)();
    } else {
      showError("Por favor, preencha todos os campos obrigatórios do prontuário antes de finalizar.");
      setIsAttemptingFinalize(false); // Resetar se a validação falhar
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

  // Mapeia os dados do prontuário para o formato do formulário
  const initialMedicalRecordData: MedicalRecordFormValues = {
    anamnesis: medicalRecord?.anamnesis || undefined,
    physicalExam: medicalRecord?.physical_exam || undefined,
    diagnosis: medicalRecord?.diagnosis || undefined,
    treatment: medicalRecord?.treatment || undefined,
    prescriptions: medicalRecord?.prescriptions || [], // Garante que seja um array vazio se for null/undefined
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
        onGenerateRecipePdf={handleGenerateRecipePdf} // Passa a função para gerar PDF
      />

      <div className="flex justify-end space-x-2"> {/* Botões de ação agrupados aqui */}
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
                {finalizeAppointmentMutation.isPending || isAttemptingFinalize ? "Finalizando..." : "Sim, Finalizar Consulta"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* NOVO: Diálogo de Encaminhamento para Internação */}
      {appointment && (
        <ForwardToInternmentDialog
          isOpen={isForwardToInternmentDialogOpen}
          onClose={() => setIsForwardToInternmentDialogOpen(false)}
          appointment={appointment}
        />
      )}

      {/* NOVO: Diálogo de Pré-visualização de PDF da Receita */}
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