"use client";

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, User, PawPrint, Stethoscope, CalendarCheck, CheckCircle, ClipboardList } from 'lucide-react'; // Removido FileText
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { showError, showSuccess } from '@/utils/toast';
import { format, parseISO, differenceInSeconds, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AppointmentChronometer from '@/components/AppointmentChronometer';
import { Appointment } from './Appointments'; // Importar a interface Appointment
import MedicalRecordForm, { MedicalRecordFormValues } from '@/components/consultation/MedicalRecordForm'; // Importar o novo formulário
// Removido: import { generateMedicalRecordPdf } from '@/utils/generateMedicalRecordPdf'; // Removido a importação da função de geração de PDF

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
  created_at: string;
  updated_at: string;
}

const ConsultationPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;

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
        .select('id, appointment_id, user_id, anamnesis, physical_exam, diagnosis, treatment, prescriptions, created_at, updated_at') // Seleção explícita
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
    mutationFn: async (recordData: MedicalRecordFormValues) => {
      if (!userId || !appointmentId) throw new Error("User or Appointment ID not available.");

      const payload = {
        user_id: userId,
        appointment_id: appointmentId,
        anamnesis: recordData.anamnesis || null,
        physical_exam: recordData.physicalExam || null,
        diagnosis: recordData.diagnosis || null,
        treatment: recordData.treatment || null,
        // Se o array de prescrições estiver vazio, envie 'null' para a coluna nullable jsonb.
        // Caso contrário, envie o array de prescrições.
        prescriptions: recordData.prescriptions && recordData.prescriptions.length > 0 ? recordData.prescriptions : null,
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
    },
    onError: (err) => {
      console.error("Error saving medical record:", err); // Log detalhado do erro
      showError(`Erro ao salvar prontuário: ${err.message}`);
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

  const handleFinalizeConsultation = () => {
    if (appointmentId) {
      finalizeAppointmentMutation.mutate(appointmentId);
    }
  };

  const handleSaveMedicalRecord = (data: MedicalRecordFormValues) => {
    saveMedicalRecordMutation.mutate(data);
  };

  // Removido: handleGeneratePdf não é mais necessário aqui

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
            <Clock className="h-5 w-5 text-muted-foreground" />
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
      />

      <div className="flex justify-end space-x-2">
        {/* Removido o botão Gerar PDF */}
        <Button
          onClick={handleFinalizeConsultation}
          disabled={finalizeAppointmentMutation.isPending}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          {finalizeAppointmentMutation.isPending ? "Finalizando..." : "Finalizar Consulta"}
        </Button>
      </div>
    </div>
  );
};

export default ConsultationPage;