"use client";

import React, { useState } from "react"; // Adicionado useState aqui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Search, CalendarCheck, CalendarX, CalendarClock, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, Play, History, ArrowRight, FileText, Pill, ArrowLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AppointmentForm, { AppointmentFormValues } from "@/components/AppointmentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AppointmentDetailsDialog from "@/components/AppointmentDetailsDialog";
import AppointmentChronometer from "@/components/AppointmentChronometer";
import AppointmentHistoryDialog from "@/components/AppointmentHistoryDialog"; // Importação atualizada
import { format, parseISO, differenceInSeconds, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { showError, showSuccess } from "@/utils/toast";
import { Client, Pet } from "@/types/cadastro";
import { useNavigate, useLocation } from "react-router-dom"; // Importar useLocation
import { usePageTitle } from "@/context/PageTitleContext";
import { MedicalRecordFormValues } from "@/components/consultation/MedicalRecordForm";
import PdfPreviewDialog from "@/components/PdfPreviewDialog";
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf';
import { uploadRecipePdfToSupabase, deleteRecipePdfFromSupabase, uploadMedicalRecordPdfToSupabase } from '@/utils/supabaseStorage';
import { generateMedicalRecordPdf } from '@/utils/generateMedicalRecordPdf'; // CORREÇÃO AQUI: Importação correta

// Definir as opções de serviço como um array para reutilização
const serviceOptions = [
  "Consulta Geral",
  "Vacinação",
  "Exame de Rotina",
  "Banho e Tosa",
  "Cirurgia",
  "Consulta de Retorno",
] as const;

// Interface para o prontuário médico (deve corresponder à tabela medical_records)
interface MedicalRecord {
  id: string;
  appointment_id: string;
  user_id: string;
  anamnesis?: string | null;
  physical_exam?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  prescriptions: { medication: string; dosage: string; frequency: string; instructions?: string }[]; // Alterado para array não nulo
  recipe_pdf_url?: string | null;
  medical_record_pdf_url?: string | null; // NOVO: URL do PDF do prontuário
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  client_name: string;
  pet_name: string;
  species: "Cachorro" | "Gato" | "Pássaro" | "Roedor" | "Peixe" | "Outros" | "Equino" | "Bovino";
  service: typeof serviceOptions[number];
  veterinarian: string;
  status: "Agendada" | "Realizada" | "Cancelada" | "Em Andamento";
  completion_timestamp?: string | null;
  created_at: string;
  start_time?: string | null;
  pet_id: string | null;
  client_id: string | null; // Adicionado client_id
  // NOVO: Adicionado para refletir os dados do prontuário aninhado
  medical_records?: MedicalRecord | null; // Alterado para ser um objeto único ou null
  prescriptions_count?: number;
  recipe_pdf_url?: string | null;
  medical_record_pdf_url?: string | null;
}

const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Equino: MoreHorizontal,
  Bovino: MoreHorizontal,
  Outros: MoreHorizontal,
};

interface ColumnDefinition {
  id: string;
  header: string;
  className?: string;
  render: (appointment: Appointment) => React.ReactNode;
}

const Appointments = () => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;
  const veterinarianName = appUser?.name || "Veterinário Desconhecido";
  const navigate = useNavigate();
  const location = useLocation(); // Inicializar useLocation
  const { setPageTitle } = usePageTitle();

  const [activeTab, setActiveTab] = React.useState<string>("em-espera");
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = React.useState<boolean>(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = React.useState<boolean>(false);

  const [isPdfPreviewDialogOpen, setIsPdfPreviewDialogOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFilename, setPdfFilename] = useState("");
  const [pdfAppointment, setPdfAppointment] = useState<Appointment | null>(null);

  const [isRecipePdfPreviewDialogOpen, setIsRecipePdfPreviewDialogOpen] = useState(false);
  const [recipePdfBlob, setRecipePdfBlob] = useState<Blob | null>(null);
  const [recipePdfUrl, setRecipePdfUrl] = useState<string | null>(null);
  const [recipePdfFilename, setRecipePdfFilename] = useState("");

  React.useEffect(() => {
    // Verifica se há um estado de navegação para definir a aba ativa
    if (location.state && (location.state as any).activeTab) {
      setActiveTab((location.state as any).activeTab);
      // Limpa o estado para que a aba não seja redefinida em futuras navegações
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  React.useEffect(() => {
    let tabName = "";
    switch (activeTab) {
      case "em-espera":
        tabName = "Em Espera";
        break;
      case "em-andamento":
        tabName = "Em Andamento";
        break;
      case "finalizadas":
        tabName = "Finalizadas";
        break;
      default:
        tabName = "";
    }
    setPageTitle(`Consultas - ${tabName}`);

    return () => {
      setPageTitle(""); 
    };
  }, [activeTab, setPageTitle]);

  // --- Queries ---
  const { data: appointments = [], isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['appointments', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          medical_records (
            prescriptions,
            recipe_pdf_url,
            medical_record_pdf_url
          )
        `)
        .eq('user_id', userId);
      if (error) throw error;
      console.log("Appointments.tsx: Raw data from Supabase for appointments query:", data);
      return data.map(app => {
        // Access medical_records directly as a single object or null
        const medicalRecordData = app.medical_records;
        const mappedApp = {
          ...app,
          prescriptions_count: medicalRecordData?.prescriptions?.length || 0,
          recipe_pdf_url: medicalRecordData?.recipe_pdf_url || null,
          medical_record_pdf_url: medicalRecordData?.medical_record_pdf_url || null,
          pet_id: app.pet_id || null,
          client_id: app.client_id || null, // Mapear client_id
        };
        console.log(`Appointments.tsx: Mapped appointment ${mappedApp.id} - recipe_pdf_url: ${mappedApp.recipe_pdf_url}, prescriptions_count: ${mappedApp.prescriptions_count}, medical_records_data:`, medicalRecordData); // ADDED LOG
        return mappedApp;
      }) as Appointment[];
    },
    enabled: !!userId,
  });

  const { data: historyAppointments = [], isLoading: isLoadingHistory, error: historyError } = useQuery<Appointment[]>({
    queryKey: ['historyAppointments', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          medical_records (
            prescriptions,
            recipe_pdf_url,
            medical_record_pdf_url
          )
        `)
        .eq('user_id', userId)
        .in('status', ['Realizada', 'Cancelada']);
      if (error) throw error;
      console.log("Appointments.tsx: Raw data from Supabase for historyAppointments query:", data);
      return data.map(app => {
        // Access medical_records directly as a single object or null
        const medicalRecordData = app.medical_records;
        const mappedApp = {
          ...app,
          prescriptions_count: medicalRecordData?.prescriptions?.length || 0,
          recipe_pdf_url: medicalRecordData?.recipe_pdf_url || null,
          medical_record_pdf_url: medicalRecordData?.medical_record_pdf_url || null,
          pet_id: app.pet_id || null,
          client_id: app.client_id || null, // Mapear client_id
        };
        console.log(`Appointments.tsx: Mapped history appointment ${mappedApp.id} - recipe_pdf_url: ${mappedApp.recipe_pdf_url}, prescriptions_count: ${mappedApp.prescriptions_count}, medical_records_data:`, medicalRecordData); // ADDED LOG
        return mappedApp;
      }) as Appointment[];
    },
    enabled: !!userId,
  });

  const { data: clients = [], isLoading: isLoadingClients, error: clientsError } = useQuery<Client[]>({
    queryKey: ['clients', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data.map(dbClient => ({
        id: dbClient.id,
        name: dbClient.name,
        email: dbClient.email,
        phone: dbClient.phone,
        cpf: dbClient.cpf,
        dateOfBirth: dbClient.date_of_birth,
        address: {
          cep: dbClient.address_cep || '',
          street: dbClient.address_street || '',
          number: dbClient.address_number || '',
          complement: dbClient.address_complement || undefined,
          neighborhood: dbClient.address_neighborhood || '',
          city: dbClient.localidade || '', // Corrected from dbClient.address_city
          state: dbClient.uf || '', // Corrected from dbClient.address_state
        },
        observations: dbClient.observations || undefined,
        photoUrl: dbClient.photo_url || undefined,
      }));
    },
    enabled: !!userId,
  });

  const { data: pets = [], isLoading: isLoadingPets, error: petsError } = useQuery<Pet[]>({
    queryKey: ['pets', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('pets')
        .select('*');
      if (error) throw error;
      return data.map(dbPet => ({
        id: dbPet.id,
        name: dbPet.name,
        species: dbPet.species as Pet["species"],
        breed: dbPet.breed,
        age: dbPet.age,
        gender: dbPet.gender as Pet["gender"],
        color: dbPet.color,
        observations: dbPet.observations || undefined,
        photoUrl: dbPet.photo_url || undefined,
        ownerId: dbPet.owner_id,
      }));
    },
    enabled: !!userId,
  });

  // --- Mutations ---
  const addAppointmentMutation = useMutation({
    mutationFn: async (newAppointmentData: AppointmentFormValues) => {
      if (!userId) throw new Error("User not authenticated.");

      const appointmentDate = format(newAppointmentData.date, "yyyy-MM-dd");

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          user_id: userId,
          date: appointmentDate,
          time: newAppointmentData.time,
          client_name: newAppointmentData.client,
          pet_name: newAppointmentData.pet,
          species: newAppointmentData.species,
          service: newAppointmentData.service,
          veterinarian: veterinarianName,
          status: "Agendada",
          client_id: newAppointmentData.selectedClientId, // Ensure client_id is passed
          pet_id: newAppointmentData.selectedPetId,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
      showSuccess("Consulta agendada com sucesso!");
      setIsAddAppointmentDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao agendar consulta: ${err.message}`);
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async (updatedAppointment: Appointment) => {
      if (!userId) throw new Error("User not authenticated.");
      const { data, error } = await supabase
        .from('appointments')
        .update({
          date: updatedAppointment.date,
          time: updatedAppointment.time,
          client_name: updatedAppointment.client_name,
          pet_name: updatedAppointment.pet_name,
          species: updatedAppointment.species,
          service: updatedAppointment.service,
          veterinarian: updatedAppointment.veterinarian,
          status: updatedAppointment.status,
          completion_timestamp: updatedAppointment.completion_timestamp,
          start_time: updatedAppointment.start_time,
          client_id: updatedAppointment.client_id, // Ensure client_id is passed
          pet_id: updatedAppointment.pet_id,
        })
        .eq('id', updatedAppointment.id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
      queryClient.invalidateQueries({ queryKey: ['historyAppointments', userId] });
      showSuccess("Consulta atualizada com sucesso!");
      setIsDetailsDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao atualizar consulta: ${err.message}`);
    },
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!userId) throw new Error("User not authenticated.");
      const now = new Date();
      const { data, error } = await supabase
        .from('appointments')
        .update({
          status: "Cancelada",
          completion_timestamp: now.toISOString(),
          start_time: null,
        })
        .eq('id', appointmentId)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
      queryClient.invalidateQueries({ queryKey: ['historyAppointments', userId] });
      showSuccess("Consulta cancelada com sucesso!");
      setIsDetailsDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao cancelar consulta: ${err.message}`);
    },
  });

  const startAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!userId) throw new Error("User not authenticated.");
      if (!appUser?.name) throw new Error("User name not available to assign as veterinarian.");

      const now = new Date();
      const { data, error } = await supabase
        .from('appointments')
        .update({
          status: "Em Andamento",
          veterinarian: appUser.name,
          start_time: now.toISOString(),
        })
        .eq('id', appointmentId)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
      showSuccess("Consulta iniciada com sucesso!");
      navigate(`/consultation/${data.id}`);
    },
    onError: (err) => {
      showError(`Erro ao iniciar consulta: ${err.message}`);
    },
  });

  const clearHistoryAppointmentsMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User not authenticated.");
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('user_id', userId)
        .in('status', ['Realizada', 'Cancelada']);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historyAppointments', userId] });
      showSuccess("Histórico de consultas limpo com sucesso!");
      setIsHistoryDialogOpen(false);
      window.location.reload(); // Recarrega a página após a limpeza do histórico
    },
    onError: (err) => {
      showError(`Erro ao limpar histórico: ${err.message}`);
    },
  });

  const fetchAndGeneratePdfMutation = useMutation({
    mutationFn: async ({ appointment }: { appointment: Appointment }) => {
      if (!userId) {
        throw new Error("User not authenticated.");
      }
      const currentUserId: string = userId;

      if (appointment.medical_records?.medical_record_pdf_url) {
        console.log("Appointments: fetchAndGeneratePdfMutation - Existing medical_record_pdf_url found, using it directly.");
        return { pdfUrl: appointment.medical_records.medical_record_pdf_url, appointment };
      }

      const { data: medicalRecordData, error: fetchError } = await supabase
        .from('medical_records')
        .select('id, appointment_id, user_id, anamnesis, physical_exam, diagnosis, treatment, prescriptions, created_at, updated_at')
        .eq('appointment_id', appointment.id)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!medicalRecordData) {
        throw new Error("Prontuário médico não encontrado para esta consulta.");
      }

      const medicalRecordForPdf: MedicalRecordFormValues = {
        anamnesis: medicalRecordData.anamnesis || undefined,
        physicalExam: medicalRecordData.physical_exam || undefined,
        diagnosis: medicalRecordData.diagnosis || undefined,
        treatment: medicalRecordData.treatment || undefined,
        prescriptions: medicalRecordData.prescriptions || [],
      };

      const clinicDetails = {
        companyName: appUser?.companyName || 'AsasVet',
        address: `${appUser?.addressStreet || ''}, ${appUser?.addressNumber || ''} ${appUser?.addressComplement || ''} - ${appUser?.addressNeighborhood || '', appUser?.addressCity || ''} - ${appUser?.addressState || ''} ${appUser?.addressCep || ''}`,
        phone: appUser?.phone || '',
        email: appUser?.email || '',
        veterinarianCrmv: appUser?.crmv || '',
        veterinarianName: `${appUser?.name || ''} ${appUser?.lastName || ''}`,
      };

      const pdfBlob = await generateMedicalRecordPdf({ 
        appointment, 
        medicalRecord: medicalRecordForPdf, 
        logoUrl: appUser?.logoUrl,
        clinicDetails,
      });

      const newPdfUrl = await uploadMedicalRecordPdfToSupabase(pdfBlob, appUser?.organizationId || userId, currentUserId, medicalRecordData.id);

      if (!newPdfUrl) {
        throw new Error("Falha ao fazer upload do PDF do prontuário.");
      }

      await supabase
        .from('medical_records')
        .update({ medical_record_pdf_url: newPdfUrl })
        .eq('id', medicalRecordData.id)
        .eq('user_id', currentUserId)
        .select('medical_record_pdf_url')
        .single();

      return { pdfBlob, pdfUrl: newPdfUrl, appointment };
    },
    onSuccess: ({ pdfBlob, pdfUrl, appointment }) => {
      queryClient.invalidateQueries({ queryKey: ['medicalRecord', appointment.id, userId] }); // CORRIGIDO: Usando appointment.id
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
      queryClient.invalidateQueries({ queryKey: ['historyAppointments', userId] });
      setPdfBlob(pdfBlob || null);
      setPdfFilename(`Prontuario_${appointment.pet_name}_${format(parseISO(appointment.date), 'yyyyMMdd')}.pdf`);
      setPdfAppointment(appointment);
      setIsPdfPreviewDialogOpen(true);
    },
    onError: (err: any) => {
      console.error("Appointments: fetchAndGeneratePdfMutation - Erro ao gerar PDF do histórico:", err);
      showError(`Erro ao gerar PDF: ${err.message || "Erro desconhecido"}`);
    },
  });

  const fetchAndGenerateRecipePdfMutation = useMutation({
    mutationFn: async ({ appointment }: { appointment: Appointment }) => {
      if (!userId) {
        throw new Error("User not authenticated.");
      }
      const currentUserId: string = userId;

      console.log(`Appointments.tsx: fetchAndGenerateRecipePdfMutation called for appointment ${appointment.id}. Current appointment object:`, appointment); // ADDED LOG
      console.log("Appointments: fetchAndGenerateRecipePdfMutation.mutationFn - Received appointment:", appointment); // ADDED LOG

      console.log("Appointments: fetchAndGenerateRecipePdfMutation - Checking for existing recipe_pdf_url:", appointment.medical_records?.recipe_pdf_url); // ADDED LOG
      if (appointment.medical_records?.recipe_pdf_url) {
        console.log("Appointments: fetchAndGenerateRecipePdfMutation - Existing recipe_pdf_url found on passed appointment, using it directly:", appointment.medical_records.recipe_pdf_url); // ADDED LOG
        return { pdfUrl: appointment.medical_records.recipe_pdf_url, appointment, pdfBlob: null }; // Return pdfBlob as null, as we are using the existing URL
      }

      console.log("Appointments: fetchAndGenerateRecipePdfMutation - No recipe_pdf_url on passed appointment, fetching medical record directly from DB."); // ADDED LOG
      // Sempre buscar o prontuário médico diretamente para garantir os dados mais recentes
      const { data: medicalRecordData, error: fetchError } = await supabase
        .from('medical_records')
        .select('id, prescriptions, recipe_pdf_url') // Incluir recipe_pdf_url na busca direta
        .eq('appointment_id', appointment.id)
        .eq('user_id', currentUserId)
        .maybeSingle();

      console.log("Appointments: fetchAndGenerateRecipePdfMutation - Fetched medicalRecordData directly:", medicalRecordData);

      if (fetchError) {
        console.error("Appointments: fetchAndGenerateRecipePdfMutation - Erro ao buscar prontuário médico:", fetchError);
        throw fetchError;
      }

      // Se o prontuário médico existe e já tem uma URL de PDF de receita, use-a diretamente
      if (medicalRecordData?.recipe_pdf_url) {
        console.log("Appointments: fetchAndGenerateRecipePdfMutation - URL de PDF de receita existente encontrada no prontuário, usando-a diretamente.");
        return { pdfUrl: medicalRecordData.recipe_pdf_url, appointment, pdfBlob: null }; // Return pdfBlob as null, as we are using the existing URL
      }

      // Ensure prescriptions is an array, even if null from DB
      const prescriptionsFromDb = medicalRecordData?.prescriptions || [];
      console.log("Appointments: fetchAndGenerateRecipePdfMutation - Prescriptions from direct DB fetch:", prescriptionsFromDb); // ADDED LOG

      // Se não há URL de PDF de receita existente ou não há prescrições, lance o erro
      if (prescriptionsFromDb.length === 0) { // Changed condition here
        console.error("Appointments: fetchAndGenerateRecipePdfMutation - Prescriptions array is empty after direct DB fetch."); // ADDED LOG
        throw new Error("Nenhuma prescrição encontrada no prontuário para gerar a receita.");
      }

      const clinicDetails = {
        companyName: appUser?.companyName || 'AsasVet',
        address: `${appUser?.addressStreet || ''}, ${appUser?.addressNumber || ''} ${appUser?.addressComplement || ''} - ${appUser?.addressNeighborhood || '', appUser?.addressCity || ''} - ${appUser?.addressState || ''} ${appUser?.addressCep || ''}`,
        phone: appUser?.phone || '',
        email: appUser?.email || '',
        veterinarianCrmv: appUser?.crmv || '',
        veterinarianName: `${appUser?.name || ''} ${appUser?.lastName || ''}`,
      };

      const pdfBlob = await generatePrescriptionPdf({
        appointment,
        prescriptions: prescriptionsFromDb,
        logoUrl: appUser?.logoUrl,
        clinicDetails,
      });

      const newPdfUrl = await uploadRecipePdfToSupabase(pdfBlob, appUser?.organizationId || userId, currentUserId, appointment.id);
      console.log("Appointments: fetchAndGenerateRecipePdfMutation - Uploaded new recipe PDF to URL:", newPdfUrl);
      if (!newPdfUrl) {
        throw new Error("Falha ao fazer upload do PDF da receita.");
      }

      await supabase
        .from('medical_records')
        .update({ recipe_pdf_url: newPdfUrl })
        .eq('id', medicalRecordData.id)
        .eq('user_id', currentUserId);
      console.log("Appointments: fetchAndGenerateRecipePdfMutation - Medical record updated with new recipe_pdf_url.");

      return { pdfBlob, pdfUrl: newPdfUrl, appointment };
    },
    onSuccess: ({ pdfBlob, pdfUrl, appointment }) => {
      if (!userId) return;
      const currentUserId: string = userId;
      queryClient.invalidateQueries({ queryKey: ['medicalRecord', appointment.id, userId] }); // CORRIGIDO: Usando appointment.id
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
      queryClient.invalidateQueries({ queryKey: ['historyAppointments', userId] });
      // Force a refetch immediately after invalidation
      queryClient.refetchQueries({ queryKey: ['appointments', userId] }); // ADDED THIS
      queryClient.refetchQueries({ queryKey: ['historyAppointments', userId] }); // ADDED THIS
      setRecipePdfBlob(pdfBlob || null);
      setRecipePdfUrl(pdfUrl || null);
      setRecipePdfFilename(`Receita_${appointment.pet_name}_${format(parseISO(appointment.date), 'yyyyMMdd')}.pdf`);
      setIsRecipePdfPreviewDialogOpen(true);
    },
    onError: (err: any) => {
      console.error("Appointments: fetchAndGenerateRecipePdfMutation - Erro ao gerar e salvar PDF da receita:", err);
      showError(`Erro ao gerar receita: ${err.message || "Erro desconhecido"}`);
    },
  });

  const handleAddAppointment = (data: AppointmentFormValues) => {
    addAppointmentMutation.mutate(data);
  };

  const handleUpdateAppointment = (updatedAppointment: Appointment) => {
    updateAppointmentMutation.mutate(updatedAppointment);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    cancelAppointmentMutation.mutate(appointmentId);
  };

  const handleStartAppointment = (appointmentId: string) => {
    startAppointmentMutation.mutate(appointmentId);
  };

  const handleRowClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };

  const handleViewHistoryDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsHistoryDialogOpen(false);
    setIsDetailsDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: Appointment["status"]) => {
    switch (status) {
      case "Agendada":
        return "bg-primary text-primary-foreground";
      case "Em Andamento":
        return "bg-orange-500 text-white";
      case "Realizada":
        return "bg-green-500 text-white";
      case "Cancelada":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    let matchesTab = false;
    switch (activeTab) {
      case "em-espera":
        matchesTab = appointment.status === "Agendada";
        break;
      case "em-andamento":
        matchesTab = appointment.status === "Em Andamento";
        break;
      case "finalizadas":
        matchesTab = appointment.status === "Realizada" || appointment.status === "Cancelada";
        break;
      default:
        matchesTab = true;
        break;
    }
    const matchesSearch =
      appointment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.pet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.veterinarian && appointment.veterinarian.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const totalAgendadas = appointments.filter(a => a.status === "Agendada").length;
  const totalRealizadas = appointments.filter(a => a.status === "Realizada").length;
  const totalCanceladas = appointments.filter(a => a.status === "Cancelada").length;
  const totalEmAndamento = appointments.filter(a => a.status === "Em Andamento").length;

  const formatDuration = (totalSeconds: number) => {
    if (totalSeconds < 0) return "N/A";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .join(":");
  };

  const handleOpenMedicalRecordPdfPreviewDialog = (appointment: Appointment) => {
    fetchAndGeneratePdfMutation.mutate({ appointment });
  };

  const handleOpenRecipePdfPreviewDialog = (appointment: Appointment) => {
    console.log(`Appointments.tsx: Clicking recipe PDF button for appointment ${appointment.id}. recipe_pdf_url: ${appointment.medical_records?.recipe_pdf_url}, prescriptions_count: ${appointment.medical_records?.prescriptions?.length}`); // ADDED LOG
    fetchAndGenerateRecipePdfMutation.mutate({ appointment });
  };

  const handleConfirmPdfDownload = (filename: string, downloadUrl: string) => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showSuccess("PDF do prontuário baixado com sucesso!");
    setIsPdfPreviewDialogOpen(false);
  };

  const handleConfirmRecipePdfDownload = (filename: string, downloadUrl: string) => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showSuccess("PDF da receita baixado com sucesso!");
    setIsRecipePdfPreviewDialogOpen(false);
  };

  const getColumns = (currentTab: string): ColumnDefinition[] => {
    const baseColumns: ColumnDefinition[] = [
      { id: 'pet', header: 'Paciente', render: (appointment: Appointment) => {
        const IconComponent = speciesIconMap[appointment.species] || MoreHorizontal;
        return (
          <div className="font-medium flex items-center">
            <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
            {appointment.pet_name}
          </div>
        );
      }},
      { id: 'client', header: 'Tutor', render: (appointment: Appointment) => <div>{appointment.client_name}</div> },
      { id: 'service', header: 'Serviço', render: (appointment: Appointment) => <div>{appointment.service}</div> },
    ];

    if (currentTab === "em-espera") {
      return [
        ...baseColumns,
        { id: 'waitingTime', header: 'Tempo de Espera', render: (appointment: Appointment) => (
          <AppointmentChronometer startTime={appointment.created_at} />
        )},
        { id: 'actions', header: 'Ações', className: 'text-right', render: (appointment: Appointment) => (
          <Button
            variant="default"
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleStartAppointment(appointment.id); }}
            disabled={startAppointmentMutation.isPending}
          >
            <Play className="mr-2 h-4 w-4" /> Iniciar
          </Button>
        )},
      ];
    } else if (currentTab === "em-andamento") {
      return [
        ...baseColumns,
        { id: 'veterinarian', header: 'Veterinário', render: (appointment: Appointment) => (
          <div className="flex items-center">
            {appointment.veterinarian || "N/A"}
            <Badge className={cn("ml-2", getStatusBadgeVariant("Em Andamento"))}>
              Iniciada
            </Badge>
          </div>
        )},
        { id: 'consultationTime', header: 'Tempo de Consulta', render: (appointment: Appointment) => (
          appointment.start_time && <AppointmentChronometer startTime={appointment.start_time} />
        )},
        { id: 'actions', header: 'Ações', className: 'text-right', render: (appointment: Appointment) => (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/consultation/${appointment.id}`); }}
          >
            <ArrowRight className="mr-2 h-4 w-4" /> Voltar para Consulta
          </Button>
        )},
      ];
    } else if (currentTab === "finalizadas") {
      return [
        ...baseColumns,
        { id: 'veterinarian', header: 'Veterinário', render: (appointment: Appointment) => (
          <div className="flex items-center">
            {appointment.veterinarian || "N/A"}
            {appointment.status === "Cancelada" && (
              <Badge className={cn("ml-2", getStatusBadgeVariant("Cancelada"))}>
                Cancelada
              </Badge>
            )}
            {appointment.status === "Realizada" && (
              <Badge className={cn("ml-2", getStatusBadgeVariant("Realizada"))}>
                Concluída
              </Badge>
            )}
          </div>
        )},
        { id: 'completion', header: 'Finalização', render: (appointment: Appointment) => (
          appointment.completion_timestamp && isValid(parseISO(appointment.completion_timestamp))
            ? format(parseISO(appointment.completion_timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
            : "N/A"
        )},
        { id: 'duration', header: 'Duração', render: (appointment: Appointment) => (
          appointment.start_time && appointment.completion_timestamp
            ? (() => {
                const start = parseISO(appointment.start_time);
                const end = parseISO(appointment.completion_timestamp);
                return isValid(start) && isValid(end) ? formatDuration(differenceInSeconds(end, start)) : "N/A";
              })()
            : "N/A"
        )},
        { id: 'waitingTime', header: 'Tempo de Espera', render: (appointment: Appointment) => (
          appointment.created_at && (appointment.start_time || appointment.completion_timestamp)
            ? (() => {
                const created = parseISO(appointment.created_at);
                const referenceTime = appointment.status === "Realizada" && appointment.start_time ? parseISO(appointment.start_time) : (appointment.status === "Cancelada" && appointment.completion_timestamp ? parseISO(appointment.completion_timestamp) : null);
                return isValid(created) && isValid(referenceTime!) ? formatDuration(differenceInSeconds(referenceTime!, created)) : "N/A";
              })()
            : "N/A"
        )},
        { id: 'medicalRecordPdf', header: 'Prontuário', className: 'text-right', render: (appointment: Appointment) => (
          <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleOpenMedicalRecordPdfPreviewDialog(appointment); }}
              disabled={fetchAndGeneratePdfMutation.isPending}
          >
              {fetchAndGeneratePdfMutation.isPending ? (
                  <span className="loading-spinner h-4 w-4" />
              ) : (
                  <FileText className="h-4 w-4" />
              )}
          </Button>
        )},
        { id: 'recipePdf', header: 'Receita', className: 'text-right', render: (appointment: Appointment) => (
          (appointment.medical_records?.recipe_pdf_url || (appointment.medical_records?.prescriptions && appointment.medical_records.prescriptions.length > 0)) ? (
              <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleOpenRecipePdfPreviewDialog(appointment); }}
                  disabled={fetchAndGenerateRecipePdfMutation.isPending}
              >
                  {fetchAndGenerateRecipePdfMutation.isPending ? (
                      <span className="loading-spinner h-4 w-4" />
                  ) : (
                      <Pill className="h-4 w-4" />
                  )}
              </Button>
          ) : (
              <span className="text-muted-foreground text-xs">N/A</span>
          )
        )},
      ];
    }
    return [];
  };

  const columns = getColumns(activeTab);

  if (isLoading || isLoadingClients || isLoadingPets || isLoadingHistory) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando consultas e dados de cadastro...</p>
      </div>
    );
  }

  if (error || clientsError || petsError || historyError) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Erro ao carregar dados: ${error?.message || clientsError?.message || petsError?.message || historyError?.message}</p>
        <Button onClick={() => navigate('/consultas')} className="ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Consultas
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Removido o div flex items-center justify-between que continha os botões */}

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gray-700 text-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em espera</CardTitle>
              <CalendarClock className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAgendadas}</div>
              <p className="text-gray-200 text-xs">Consultas aguardando</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-500 text-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <CalendarClock className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmAndamento}</div>
              <p className="text-white/80 text-xs">Consultas em progresso</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500 text-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Realizadas</CardTitle>
              <CalendarCheck className="h-4 w-4 text-white" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRealizadas}</div>
              <p className="text-white/80 text-xs">Consultas concluídas</p>
            </CardContent>
          </Card>
          <Card className="bg-destructive text-destructive-foreground shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
              <CalendarX className="h-4 w-4 text-destructive-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCanceladas}</div>
              <p className="text-destructive-foreground/80 text-xs">Consultas canceladas</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-2">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "em-espera" | "em-andamento" | "finalizadas")} className="w-full md:w-auto flex-1">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="em-espera" className="data-[state=active]:bg-gray-500 data-[state=active]:text-white">Em Espera</TabsTrigger>
              <TabsTrigger value="em-andamento" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Em Andamento</TabsTrigger>
              <TabsTrigger value="finalizadas" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Finalizadas</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar consultas..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button onClick={() => setIsHistoryDialogOpen(true)} variant="default">
              <History className="mr-2 h-4 w-4" /> Ver Histórico
            </Button>
            <Dialog open={isAddAppointmentDialogOpen} onOpenChange={setIsAddAppointmentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar consulta a fila
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl max-h-[60vh] overflow-y-auto p-6">
                <DialogHeader>
                  <DialogTitle>Incluir Nova Consulta</DialogTitle>
                </DialogHeader>
                <AppointmentForm
                  onSubmit={handleAddAppointment}
                  onCancel={() => setIsAddAppointmentDialogOpen(false)}
                  allClients={clients}
                  allPets={pets}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map(col => (
                  <TableHead key={col.id} className={cn(col.className)}>{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <TableRow
                    key={appointment.id}
                    onClick={() => handleRowClick(appointment)}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50"
                    )}
                  >
                    {columns.map(col => (
                      <TableCell key={col.id} className={cn(col.className)}>
                        {col.render(appointment)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Nenhuma consulta encontrada para esta aba.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <AppointmentDetailsDialog
          appointment={selectedAppointment}
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          onUpdate={handleUpdateAppointment}
          onCancelAppointment={handleCancelAppointment}
          onStartAppointment={handleStartAppointment}
        />

        <AppointmentHistoryDialog
          isOpen={isHistoryDialogOpen}
          onClose={() => setIsHistoryDialogOpen(false)}
          historyAppointments={historyAppointments}
          onViewDetails={handleViewHistoryDetails}
          onClearHistory={clearHistoryAppointmentsMutation.mutate}
          isClearingHistory={clearHistoryAppointmentsMutation.isPending}
          onViewMedicalRecordPdf={handleOpenMedicalRecordPdfPreviewDialog} {/* NOVO */}
          onViewRecipePdf={handleOpenRecipePdfPreviewDialog} {/* NOVO */}
        />

        <PdfPreviewDialog
          isOpen={isPdfPreviewDialogOpen}
          onClose={() => setIsPdfPreviewDialogOpen(false)}
          pdfBlob={pdfBlob}
          filename={pdfFilename}
          onConfirmDownload={handleConfirmPdfDownload}
          pdfUrl={pdfAppointment?.medical_records?.medical_record_pdf_url || null}
        />

        <PdfPreviewDialog
          isOpen={isRecipePdfPreviewDialogOpen}
          onClose={() => setIsRecipePdfPreviewDialogOpen(false)}
          pdfBlob={recipePdfBlob}
          pdfUrl={recipePdfUrl}
          filename={recipePdfFilename}
          onConfirmDownload={handleConfirmRecipePdfDownload}
        />
      </div>
    </>
  );
};

export default Appointments;