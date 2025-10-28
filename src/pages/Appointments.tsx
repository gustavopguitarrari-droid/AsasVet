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
import { PlusCircle, Search, CalendarCheck, CalendarX, CalendarClock, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, Play, History, ArrowRight, FileText, Pill } from "lucide-react"; // Importar ArrowRight, FileText e Pill
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AppointmentForm, { AppointmentFormValues } from "@/components/AppointmentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AppointmentDetailsDialog from "@/components/AppointmentDetailsDialog";
import AppointmentChronometer from "@/components/AppointmentChronometer";
import AppointmentHistoryDialog from "@/components/AppointmentHistoryDialog";
import { format, parseISO, differenceInSeconds, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { showError, showSuccess } from "@/utils/toast";
import { Client, Pet } from "@/types/cadastro";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/context/PageTitleContext"; // NOVO: Importar usePageTitle
import { generateMedicalRecordPdf } from "@/utils/generateMedicalRecordPdf"; // Importar função de PDF
import { MedicalRecordFormValues } from "@/components/consultation/MedicalRecordForm"; // Importar tipo de formulário
import PdfPreviewDialog from "@/components/PdfPreviewDialog"; // Importar diálogo de pré-visualização
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf'; // NOVO: Importar função de PDF de receita
import { uploadRecipePdfToSupabase, deleteRecipePdfFromSupabase } from '@/utils/supabaseStorage'; // NOVO: Funções de storage para receita

// Definir as opções de serviço como um array para reutilização
const serviceOptions = [
  "Consulta Geral",
  "Vacinação",
  "Exame de Rotina",
  "Banho e Tosa",
  "Cirurgia",
  "Consulta de Retorno",
] as const;

export interface Appointment {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  client_name: string;
  pet_name: string;
  species: "Cachorro" | "Gato" | "Pássaro" | "Roedor" | "Peixe" | "Outros"; // Tipo de enumeração
  service: typeof serviceOptions[number]; // Tipo de enumeração
  veterinarian: string;
  status: "Agendada" | "Realizada" | "Cancelada" | "Em Andamento";
  completion_timestamp?: string | null; // Alterado para timestamp ISO (UTC)
  created_at: string;
  start_time?: string | null;
  prescriptions_count?: number; // NOVO: Contagem de prescrições
  recipe_pdf_url?: string | null; // NOVO: URL do PDF da receita
}

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
  recipe_pdf_url?: string | null; // NOVO: URL do PDF da receita
  created_at: string;
  updated_at: string;
}

const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
};

// Definir um tipo para a definição da coluna
interface ColumnDefinition {
  id: string;
  header: string;
  className?: string; // Torna className opcional
  render: (appointment: Appointment) => React.ReactNode;
}

const Appointments = () => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;
  const veterinarianName = appUser?.name || "Veterinário Desconhecido";
  const navigate = useNavigate();
  const { setPageTitle } = usePageTitle(); // NOVO: Obter setPageTitle do contexto

  const [activeTab, setActiveTab] = React.useState<string>("em-espera");
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null);
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = React.useState<boolean>(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = React.useState<boolean>(false);

  // Estados para o diálogo de pré-visualização de PDF
  const [isPdfPreviewDialogOpen, setIsPdfPreviewDialogOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFilename, setPdfFilename] = useState("");
  const [pdfAppointment, setPdfAppointment] = useState<Appointment | null>(null);

  // Estados para o diálogo de pré-visualização de PDF de receita
  const [isRecipePdfPreviewDialogOpen, setIsRecipePdfPreviewDialogOpen] = useState(false);
  const [recipePdfBlob, setRecipePdfBlob] = useState<Blob | null>(null);
  const [recipePdfUrl, setRecipePdfUrl] = useState<string | null>(null); // NOVO: Para URL direta
  const [recipePdfFilename, setRecipePdfFilename] = useState("");

  // NOVO: Efeito para atualizar o título da página com base na aba ativa
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
    setPageTitle(`Consultas - ${tabName}`); // Definir o título dinâmico

    // Função de limpeza para redefinir o título quando o componente for desmontado
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
            recipe_pdf_url
          )
        `)
        .eq('user_id', userId);
      if (error) throw error;
      console.log("Appointments.tsx: Raw data from Supabase for appointments query:", data); // ADDED LOG
      return data.map(app => ({
        ...app,
        // Assuming medical_records is an array, take the first one if it exists
        // and extract prescriptions. Handle null/undefined cases.
        prescriptions_count: app.medical_records?.[0]?.prescriptions?.length || 0,
        recipe_pdf_url: app.medical_records?.[0]?.recipe_pdf_url || null,
      })) as Appointment[];
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
            recipe_pdf_url
          )
        `)
        .eq('user_id', userId)
        .in('status', ['Realizada', 'Cancelada']);
      if (error) throw error;
      console.log("Appointments.tsx: Raw data from Supabase for historyAppointments query:", data); // ADDED LOG
      return data.map(app => ({
        ...app,
        prescriptions_count: app.medical_records?.[0]?.prescriptions?.length || 0,
        recipe_pdf_url: app.medical_records?.[0]?.recipe_pdf_url || null,
      })) as Appointment[];
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
          city: dbClient.address_city || '',
          state: dbClient.address_state || '',
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
        species: dbPet.species as Pet["species"], // Cast para o tipo de enumeração
        breed: dbPet.breed,
        age: dbPet.age,
        gender: dbPet.gender as Pet["gender"], // Cast para o tipo de enumeração
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
        })
        .select()
        .single();
      if (error) throw error;
      return data as Appointment; // Cast para o tipo correto
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
        })
        .eq('id', updatedAppointment.id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data as Appointment; // Cast para o tipo correto
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
      return data as Appointment; // Cast para o tipo correto
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
      return data as Appointment; // Cast para o tipo correto
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

  // NEW: Mutation for clearing history appointments
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
    },
    onError: (err) => {
      showError(`Erro ao limpar histórico: ${err.message}`);
    },
  });

  // Mutation to fetch the medical record and generate the PDF
  const fetchAndGeneratePdfMutation = useMutation({
    mutationFn: async ({ appointment }: { appointment: Appointment }) => {
      if (!userId) {
        throw new Error("User not authenticated.");
      }
      const currentUserId: string = userId;

      // First, fetch the medical record
      const { data: medicalRecordData, error: fetchError } = await supabase
        .from('medical_records')
        .select('id, appointment_id, user_id, anamnesis, physical_exam, diagnosis, treatment, prescriptions, created_at, updated_at')
        .eq('appointment_id', appointment.id)
        .eq('user_id', currentUserId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error("Prontuário médico não encontrado para esta consulta.");
        }
        throw fetchError;
      }

      if (!medicalRecordData) {
        throw new Error("Prontuário médico não encontrado.");
      }

      // Map medical record data to form values for PDF generation
      const medicalRecordForPdf: MedicalRecordFormValues = {
        anamnesis: medicalRecordData.anamnesis || undefined,
        physicalExam: medicalRecordData.physical_exam || undefined,
        diagnosis: medicalRecordData.diagnosis || undefined,
        treatment: medicalRecordData.treatment || undefined,
        prescriptions: medicalRecordData.prescriptions || [],
      };

      // Generate the PDF
      const blob = await generateMedicalRecordPdf({ 
        appointment, 
        medicalRecord: medicalRecordForPdf, 
        logoUrl: appUser?.logoUrl,
        clinicDetails: {
          companyName: appUser?.companyName || 'AsasVet',
          address: `${appUser?.addressStreet || ''}, ${appUser?.addressNumber || ''} ${appUser?.addressComplement || ''} - ${appUser?.addressNeighborhood || ''}, ${appUser?.addressCity || ''} - ${appUser?.addressState || ''} ${appUser?.addressCep || ''}`,
          phone: appUser?.phone || '',
          email: appUser?.email || '',
          veterinarianCrmv: appUser?.crmv || '',
          veterinarianName: `${appUser?.name || ''} ${appUser?.lastName || ''}`,
        }
      });

      return { blob, appointment };
    },
    onSuccess: ({ blob, appointment }) => {
      setPdfBlob(blob);
      setPdfFilename(`Prontuario_${appointment.pet_name}_${format(parseISO(appointment.date), 'yyyyMMdd')}.pdf`);
      setPdfAppointment(appointment);
      setIsPdfPreviewDialogOpen(true);
    },
    onError: (err: any) => {
      console.error("Appointments: fetchAndGeneratePdfMutation - Erro ao gerar PDF do histórico:", err);
      showError(`Erro ao gerar PDF: ${err.message || "Erro desconhecido"}`);
    },
  });

  // NOVO: Mutação para buscar o prontuário médico e gerar o PDF da receita
  const fetchAndGenerateRecipePdfMutation = useMutation({
    mutationFn: async ({ appointment }: { appointment: Appointment }) => {
      if (!userId) {
        throw new Error("User not authenticated.");
      }
      const currentUserId: string = userId;

      console.log("Appointments: fetchAndGenerateRecipePdfMutation - Checking for existing recipe_pdf_url:", appointment.recipe_pdf_url);
      // Se já existe uma URL de PDF de receita, use-a diretamente
      if (appointment.recipe_pdf_url) {
        console.log("Appointments: fetchAndGenerateRecipePdfMutation - Existing recipe_pdf_url found, using it directly.");
        return { pdfUrl: appointment.recipe_pdf_url, appointment };
      }

      // Caso contrário, busque as prescrições e gere o PDF
      console.log("Appointments: fetchAndGenerateRecipePdfMutation - No existing recipe_pdf_url, fetching medical record for prescriptions.");
      const { data: medicalRecordData, error: fetchError } = await supabase
        .from('medical_records')
        .select('id, prescriptions')
        .eq('appointment_id', appointment.id)
        .eq('user_id', currentUserId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          throw new Error("Prontuário médico não encontrado para esta consulta.");
        }
        throw fetchError;
      }

      if (!medicalRecordData || !medicalRecordData.prescriptions || medicalRecordData.prescriptions.length === 0) {
        throw new Error("Nenhuma prescrição encontrada no prontuário para gerar a receita.");
      }

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
        prescriptions: medicalRecordData.prescriptions,
        logoUrl: appUser?.logoUrl,
        clinicDetails,
      });

      // Upload the newly generated PDF and get its URL
      const newPdfUrl = await uploadRecipePdfToSupabase(pdfBlob, currentUserId, appointment.id);
      console.log("Appointments: fetchAndGenerateRecipePdfMutation - Uploaded new recipe PDF to URL:", newPdfUrl);
      if (!newPdfUrl) {
        throw new Error("Falha ao fazer upload do PDF da receita.");
      }

      // Update the medical record with the new PDF URL
      await supabase
        .from('medical_records')
        .update({ recipe_pdf_url: newPdfUrl })
        .eq('id', medicalRecordData.id)
        .eq('user_id', currentUserId);
      console.log("Appointments: fetchAndGenerateRecipePdfMutation - Medical record updated with new recipe_pdf_url.");

      return { pdfBlob, pdfUrl: newPdfUrl, appointment };
    },
    onSuccess: ({ pdfBlob, pdfUrl, appointment }) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] }); // Invalida para atualizar recipe_pdf_url
      queryClient.invalidateQueries({ queryKey: ['historyAppointments', userId] });
      setRecipePdfBlob(pdfBlob || null); // Pode ser null se a URL existente foi usada
      setRecipePdfUrl(pdfUrl || null); // Define a URL direta
      setRecipePdfFilename(`Receita_${appointment.pet_name}_${format(parseISO(appointment.date), 'yyyyMMdd')}.pdf`);
      setIsRecipePdfPreviewDialogOpen(true);
    },
    onError: (err: any) => {
      console.error("Appointments: fetchAndGenerateRecipePdfMutation - Erro ao gerar PDF da receita do histórico:", err);
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

  // Helper function to format time as HH:mm:ss
  const formatDuration = (totalSeconds: number) => {
    if (totalSeconds < 0) return "N/A";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .join(":");
  };

  // Handler to open PDF preview dialog
  const handleOpenMedicalRecordPdfPreviewDialog = (appointment: Appointment) => {
    fetchAndGeneratePdfMutation.mutate({ appointment });
  };

  // Handler to open Recipe PDF preview dialog
  const handleOpenRecipePdfPreviewDialog = (appointment: Appointment) => {
    fetchAndGenerateRecipePdfMutation.mutate({ appointment });
  };

  // Handler to confirm PDF download
  const handleConfirmPdfDownload = (filename: string, downloadUrl: string) => {
    // Create a download link
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

  // Define as colunas da tabela dinamicamente
  const getColumns = (currentTab: string): ColumnDefinition[] => { // Usando o tipo ColumnDefinition
    const baseColumns: ColumnDefinition[] = [
      { id: 'pet', header: 'Paciente', render: (appointment: Appointment) => {
        const IconComponent = speciesIconMap[appointment.species] || MoreHorizontal;
        return (
          <TableCell className="font-medium flex items-center">
            <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
            {appointment.pet_name}
          </TableCell>
        );
      }},
      { id: 'client', header: 'Tutor', render: (appointment: Appointment) => <TableCell>{appointment.client_name}</TableCell> },
      { id: 'service', header: 'Serviço', render: (appointment: Appointment) => <TableCell>{appointment.service}</TableCell> },
    ];

    if (currentTab === "em-espera") {
      return [
        ...baseColumns,
        { id: 'waitingTime', header: 'Tempo de Espera', render: (appointment: Appointment) => (
          <TableCell>
            <AppointmentChronometer startTime={appointment.created_at} />
          </TableCell>
        )},
        { id: 'actions', header: 'Ações', className: 'text-right', render: (appointment: Appointment) => (
          <TableCell className="text-right">
            <Button
              variant="default"
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleStartAppointment(appointment.id); }}
              disabled={startAppointmentMutation.isPending}
            >
              <Play className="mr-2 h-4 w-4" /> Iniciar
            </Button>
          </TableCell>
        )},
      ];
    } else if (currentTab === "em-andamento") {
      return [
        ...baseColumns,
        { id: 'veterinarian', header: 'Veterinário', render: (appointment: Appointment) => (
          <TableCell className="flex items-center">
            {appointment.veterinarian || "N/A"}
            <Badge className={cn("ml-2", getStatusBadgeVariant("Em Andamento"))}>
              Iniciada
            </Badge>
          </TableCell>
        )},
        { id: 'consultationTime', header: 'Tempo de Consulta', render: (appointment: Appointment) => (
          <TableCell>
            {appointment.start_time && <AppointmentChronometer startTime={appointment.start_time} />}
          </TableCell>
        )},
        { id: 'actions', header: 'Ações', className: 'text-right', render: (appointment: Appointment) => (
          <TableCell className="text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); navigate(`/consultation/${appointment.id}`); }}
            >
              <ArrowRight className="mr-2 h-4 w-4" /> Voltar para Consulta
            </Button>
          </TableCell>
        )},
      ];
    } else if (currentTab === "finalizadas") {
      return [
        ...baseColumns,
        { id: 'veterinarian', header: 'Veterinário', render: (appointment: Appointment) => (
          <TableCell className="flex items-center">
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
          </TableCell>
        )},
        { id: 'completion', header: 'Finalização', render: (appointment: Appointment) => (
          <TableCell>
            {appointment.completion_timestamp && isValid(parseISO(appointment.completion_timestamp))
              ? format(parseISO(appointment.completion_timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })
              : "N/A"}
          </TableCell>
        )},
        { id: 'duration', header: 'Duração', render: (appointment: Appointment) => (
          <TableCell>{
            appointment.start_time && appointment.completion_timestamp
              ? (() => {
                  const start = parseISO(appointment.start_time);
                  const end = parseISO(appointment.completion_timestamp);
                  return isValid(start) && isValid(end) ? formatDuration(differenceInSeconds(end, start)) : "N/A";
                })()
              : "N/A"
          }</TableCell>
        )},
        { id: 'waitingTime', header: 'Tempo de Espera', render: (appointment: Appointment) => (
          <TableCell>{
            appointment.created_at && (appointment.start_time || appointment.completion_timestamp)
              ? (() => {
                  const created = parseISO(appointment.created_at);
                  const referenceTime = appointment.status === "Realizada" && appointment.start_time ? parseISO(appointment.start_time) : (appointment.status === "Cancelada" && appointment.completion_timestamp ? parseISO(appointment.completion_timestamp) : null);
                  return isValid(created) && isValid(referenceTime!) ? formatDuration(differenceInSeconds(referenceTime!, created)) : "N/A";
                })()
              : "N/A"
          }</TableCell>
        )},
        { id: 'prescriptions', header: 'Receitas', render: (appointment: Appointment) => (
          <TableCell>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (appointment.prescriptions_count && appointment.prescriptions_count > 0) {
                  showSuccess(`${appointment.prescriptions_count} prescrição(ões) no prontuário.`);
                } else {
                  showError("Nenhuma prescrição encontrada para esta consulta.");
                }
              }}
              className="flex items-center justify-center gap-1"
            >
              <Pill className="h-4 w-4" />
              <span>{appointment.prescriptions_count || 0}</span>
            </Button>
          </TableCell>
        )},
        { id: 'pdfActions', header: 'Prontuário / Receita', className: 'text-right', render: (appointment: Appointment) => (
          <TableCell className="text-right">
            <div className="flex justify-end space-x-2">
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
              {appointment.recipe_pdf_url && (
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
              )}
            </div>
          </TableCell>
        )},
      ];
    }
    return []; // Fallback, though all tabs should be covered
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
        <p>Erro ao carregar dados: {error?.message || clientsError?.message || petsError?.message || historyError?.message}</p>
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto flex-1"> {/* Adicionado flex-1 */}
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
          {/* Botões movidos para cá, alinhados à direita */}
          <div className="flex space-x-2 mt-4 md:mt-0"> {/* Adicionado margem superior para mobile */}
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
                  onCancel={() => setIsAddAppointmentDialogOpen(false)} // Passa o handler de cancelamento
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
                    {columns.map(col => <React.Fragment key={col.id}>{col.render(appointment)}</React.Fragment>)}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Nenhuma consulta encontrada.
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
          onClearHistory={() => clearHistoryAppointmentsMutation.mutate()}
          isClearingHistory={clearHistoryAppointmentsMutation.isPending}
        />
      </div>

      <PdfPreviewDialog
        isOpen={isPdfPreviewDialogOpen}
        onClose={() => setIsPdfPreviewDialogOpen(false)}
        pdfBlob={pdfBlob}
        filename={pdfFilename}
        onConfirmDownload={handleConfirmPdfDownload}
      />

      {/* NOVO: Diálogo de Pré-visualização de PDF da Receita */}
      <PdfPreviewDialog
        isOpen={isRecipePdfPreviewDialogOpen}
        onClose={() => setIsRecipePdfPreviewDialogOpen(false)}
        pdfBlob={recipePdfBlob}
        pdfUrl={recipePdfUrl}
        filename={recipePdfFilename}
        onConfirmDownload={handleConfirmRecipePdfDownload}
      />
    </>
  );
};

export default Appointments;