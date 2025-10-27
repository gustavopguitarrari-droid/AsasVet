"use client";

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, User, PawPrint, Stethoscope, CalendarCheck, CheckCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { showError, showSuccess } from '@/utils/toast';
import { format, parseISO, differenceInSeconds, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AppointmentChronometer from '@/components/AppointmentChronometer';
import { Appointment } from './Appointments'; // Importar a interface Appointment

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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Carregando detalhes da consulta...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full text-destructive">
          <p>Erro ao carregar consulta: {error.message}</p>
          <Button onClick={() => navigate('/consultas')} className="ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Consultas
          </Button>
        </div>
      </Layout>
    );
  }

  if (!appointment) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>Consulta não encontrada.</p>
          <Button onClick={() => navigate('/consultas')} className="ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Consultas
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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

        {/* Conteúdo da consulta aqui (ex: formulários de prontuário, observações, etc.) */}
        <Card>
          <CardHeader>
            <CardTitle>Prontuário e Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              (Espaço para adicionar campos de prontuário, exames, medicações, etc.)
            </p>
            {/* Exemplo de um campo de texto para observações */}
            {/* <Textarea placeholder="Adicione observações da consulta..." rows={5} /> */}
          </CardContent>
        </Card>

        <div className="flex justify-end">
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
    </Layout>
  );
};

export default ConsultationPage;