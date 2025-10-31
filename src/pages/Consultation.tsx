"use client";

import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, User, PawPrint, Stethoscope, CalendarCheck, CheckCircle, ClipboardList, Hospital, AlertTriangle, PlusCircle, DollarSign, ReceiptText, XCircle, FileText } from 'lucide-react';
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
import { uploadRecipePdfToSupabase, deleteRecipePdfFromSupabase, uploadMedicalRecordPdfToSupabase, deleteMedicalRecordPdfFromSupabase } from '@/utils/supabaseStorage';
import PdfPreviewDialog from '@/components/PdfPreviewDialog';
import { Client, Pet } from '@/types/cadastro';
import { TeamMember } from '@/pages/Veterinarios';
import AddAnimalDebitDialog, { AddAnimalDebitFormValues } from '@/components/consultation/AddAnimalDebitDialog';
import { AnimalDebit, Product } from '@/types/cashier';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { generateMedicalRecordPdf } from '@/utils/generateMedicalRecordPdf';

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
  recipe_pdf_url?: string | null;
  medical_record_pdf_url?: string | null;
  created_at: string;
  updated_at: string;
}

const ConsultationPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;
  const organizationId = appUser?.organizationId;

  const [isForwardToInternmentDialogOpen, setIsForwardToInternmentDialogOpen] = React.useState(false);
  const [isFinalizeConfirmDialogOpen, setIsFinalizeConfirmDialogOpen] = useState(false);

  const medicalRecordFormRef = useRef<MedicalRecordFormInstance>(null);
  const [isMedicalRecordFormValid, setIsMedicalRecordFormValid] = useState(false);
  const [isAttemptingFinalize, setIsAttemptingFinalize] = useState(false);

  const [isRecipePdfPreviewDialogOpen, setIsRecipePdfPreviewDialogOpen] = useState(false);
  const [recipePdfBlob, setRecipePdfBlob] = useState<Blob | null>(null);
  const [recipePdfUrl, setRecipePdfUrl] = useState<string | null>(null);
  const [recipePdfFilename, setRecipePdfFilename] = useState("");

  const [isMedicalRecordPdfPreviewDialogOpen, setIsMedicalRecordPdfPreviewDialogOpen] = useState(false);
  const [medicalRecordPdfBlob, setMedicalRecordPdfBlob] = useState<Blob | null>(null);
  const [medicalRecordPdfUrl, setMedicalRecordPdfUrl] = useState<string | null>(null);
  const [medicalRecordPdfFilename, setMedicalRecordPdfFilename] = useState("");

  const [isAddAnimalDebitDialogOpen, setIsAddAnimalDebitDialogOpen] = useState(false);

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
        .select('id, appointment_id, user_id, anamnesis, physical_exam, diagnosis, treatment, prescriptions, recipe_pdf_url, medical_record_pdf_url, created_at, updated_at')
        .eq('appointment_id', appointmentId)
        .eq('user_id', userId)
        .maybeSingle();
      if (error) {
        console.error("ConsultationPage: Error fetching medical record:", error);
        throw error;
      }
      if (!data) {
        console.log("ConsultationPage: No medical record found for appointment", appointmentId, ". Returning null.");
        return null;
      }
      console.log("ConsultationPage: Raw medical record data from Supabase:", data); // ADDED LOG
      // Garante que prescriptions seja sempre um array
      return {
        ...data,
        prescriptions: data.prescriptions || [],
      } as MedicalRecord;
    },
    enabled: !!userId && !!appointmentId,
  });

  // Fetch all clients
  const { data: allClients = [], isLoading: isLoadingClients, error: clientsError } = useQuery<Client[]>({
    queryKey: ['allClientsConsultation', userId],
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
          city: dbClient.localidade || '',
          state: dbClient.uf || '',
        },
        observations: dbClient.observations || undefined,
        photoUrl: dbClient.photo_url || undefined,
      }));
    },
    enabled: !!userId,
  });

  // Fetch all pets
  const { data: allPets = [], isLoading: isLoadingPets, error: petsError } = useQuery<Pet[]>({
    queryKey: ['allPetsConsultation', userId],
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
        weight: dbPet.weight || undefined,
        observations: dbPet.observations || undefined,
        photoUrl: dbPet.photo_url || undefined,
        ownerId: dbPet.owner_id,
      }));
    },
    enabled: !!userId,
  });

  // Fetch all veterinarians (team members with role 'Veterinário')
  const { data: allVeterinarians = [], isLoading: isLoadingVeterinarians, error: veterinariansError } = useQuery<TeamMember[]>({
    queryKey: ['allVeterinariansConsultation', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, crmv, role')
        .eq('role', 'Veterinário');
      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!userId,
  });

  // NOVO: Query para buscar todos os produtos/serviços
  const { data: products = [], isLoading: isLoadingProducts, error: productsError } = useQuery<Product[]>({
    queryKey: ['productsConsultation', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!userId,
  });

  // NOVO: Query para buscar débitos do animal para esta consulta
  const { data: animalDebits = [], isLoading: isLoadingAnimalDebits, error: animalDebitsError } = useQuery<AnimalDebit[]>({
    queryKey: ['animalDebits', appointmentId, userId],
    queryFn: async () => {
      if (!userId || !appointmentId) return [];
      const { data, error } = await supabase
        .from('animal_debits')
        .select('*')
        .eq('appointment_id', appointmentId)
        .eq('user_id', userId);
      if (error) throw error;
      return data as AnimalDebit[];
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
    mutationFn: async ({ prescriptions, shouldOpenPreview = false }: { prescriptions: MedicalRecordFormValues['prescriptions']; shouldOpenPreview?: boolean }) => {
      console.log("generateAndSaveRecipePdfMutation: Iniciando...");
      if (!userId || !appointmentId || !appointment || !organizationId) { // Added organizationId check
        console.error("generateAndSaveRecipePdfMutation: Dados da consulta, usuário ou organização não disponíveis.");
        throw new Error("Dados da consulta, usuário ou organização não disponíveis.");
      }
      if (!prescriptions || prescriptions.length === 0) {
        console.error("generateAndSaveRecipePdfMutation: Nenhuma prescrição para gerar a receita.");
        throw new Error("Nenhuma prescrição para gerar a receita.");
      }
      console.log("generateAndSaveRecipePdfMutation: Prescriptions to save:", prescriptions); // ADDED LOG
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
            medical_record_pdf_url: null,
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
        .maybeSingle();

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
      const newPdfUrl = await uploadRecipePdfToSupabase(pdfBlob, organizationId, appointmentId); // CORRECTED HERE: using organizationId
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
      return { pdfBlob, newPdfUrl, shouldOpenPreview };
    },
    onSuccess: ({ pdfBlob, newPdfUrl, shouldOpenPreview }) => {
      console.log("generateAndSaveRecipePdfMutation: onSuccess - Invalidando queries e mostrando sucesso.");
      queryClient.invalidateQueries({ queryKey: ['medicalRecord', appointmentId, userId] });
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
      queryClient.invalidateQueries({ queryKey: ['historyAppointments', userId] });
      showSuccess("Receita PDF gerada e salva com sucesso!");
      if (shouldOpenPreview) {
        setRecipePdfBlob(pdfBlob);
        setRecipePdfUrl(newPdfUrl);
        setRecipePdfFilename(`Receita_${appointment?.pet_name}_${format(parseISO(appointment?.date || new Date().toISOString()), 'yyyyMMdd')}.pdf`);
        setIsRecipePdfPreviewDialogOpen(true);
      }
    },
    onError: (err: any) => {
      console.error("ConsultationPage: generateAndSaveRecipePdfMutation - Erro ao gerar e salvar PDF da receita:", err);
      showError(`Erro ao gerar receita: ${err.message || "Erro desconhecido"}`);
    },
  });

  // Mutação para salvar/atualizar o prontuário médico
  const saveMedicalRecordMutation = useMutation({
    mutationFn: async (recordData: MedicalRecordFormValues) => {
      if (!userId || !appointmentId || !appointment || !organizationId) throw new Error("User, Appointment, or Appointment ID not available.");

      const clinicDetails = {
        companyName: appUser?.companyName || 'AsasVet',
        address: `${appUser?.addressStreet || ''}, ${appUser?.addressNumber || ''} ${appUser?.addressComplement || ''} - ${appUser?.addressNeighborhood || ''}, ${appUser?.addressCity || ''} - ${appUser?.addressState || ''} ${appUser?.addressCep || ''}`,
        phone: appUser?.phone || '',
        email: appUser?.email || '',
        veterinarianCrmv: appUser?.crmv || '',
        veterinarianName: `${appUser?.name || ''} ${appUser?.lastName || ''}`,
      };

      let currentMedicalRecordId = medicalRecord?.id;
      let existingMedicalRecordPdfUrl = medicalRecord?.medical_record_pdf_url;

      // 1. Se não houver prontuário, crie um para obter um ID
      if (!currentMedicalRecordId) {
        console.log("ConsultationPage: saveMedicalRecordMutation - No existing medical record, creating a new one.");
        const { data: newRecord, error: insertRecordError } = await supabase
          .from('medical_records')
          .insert({
            user_id: userId,
            appointment_id: appointmentId,
            anamnesis: recordData.anamnesis || null,
            physical_exam: recordData.physicalExam || null,
            diagnosis: recordData.diagnosis || null,
            treatment: recordData.treatment || null,
            prescriptions: [],
            medical_record_pdf_url: null,
          })
          .select('id')
          .single();

        if (insertRecordError || !newRecord) {
          console.error("saveMedicalRecordMutation: Erro ao criar novo prontuário:", insertRecordError);
          throw insertRecordError || new Error("Failed to create a new medical record.");
        }
        currentMedicalRecordId = newRecord.id;
        console.log("ConsultationPage: saveMedicalRecordMutation - New medical record created with ID:", currentMedicalRecordId);
      } else {
        // Se existe, e tem um PDF antigo, delete-o antes de gerar um novo
        if (existingMedicalRecordPdfUrl) {
          console.log("saveMedicalRecordMutation: Existing medical record PDF found, attempting to delete:", existingMedicalRecordPdfUrl);
          await deleteMedicalRecordPdfFromSupabase(existingMedicalRecordPdfUrl);
        }
      }

      // 2. Gerar o PDF do prontuário
      console.log("ConsultationPage: saveMedicalRecordMutation - Gerando PDF do prontuário...");
      const medicalRecordPdfBlob = await generateMedicalRecordPdf({
        appointment,
        medicalRecord: recordData,
        logoUrl: appUser?.logoUrl,
        clinicDetails,
      });
      console.log("ConsultationPage: saveMedicalRecordMutation - PDF do prontuário Blob gerado.");

      // 3. Fazer upload do PDF do prontuário para o Supabase Storage
      console.log("ConsultationPage: saveMedicalRecordMutation - Fazendo upload do PDF do prontuário para o Supabase Storage...");
      const newMedicalRecordPdfUrl = await uploadMedicalRecordPdfToSupabase(medicalRecordPdfBlob, organizationId, currentMedicalRecordId); // CORRECTED HERE: using organizationId
      if (!newMedicalRecordPdfUrl) {
        throw new Error("Falha ao fazer upload do PDF do prontuário.");
      }
      console.log("ConsultationPage: saveMedicalRecordMutation - Novo PDF do prontuário uploaded, URL:", newMedicalRecordPdfUrl);

      // 4. Atualizar o prontuário médico com a nova URL do PDF e os dados do formulário
      const payload = {
        anamnesis: recordData.anamnesis || null,
        physical_exam: recordData.physicalExam || null,
        diagnosis: recordData.diagnosis || null,
        treatment: recordData.treatment || null,
        prescriptions: recordData.prescriptions && recordData.prescriptions.length > 0 ? recordData.prescriptions : [],
        medical_record_pdf_url: newMedicalRecordPdfUrl,
      };

      console.log("ConsultationPage: Payload being sent to medical_records (update):", JSON.stringify(payload, null, 2));
      const { data, error } = await supabase
        .from('medical_records')
        .update(payload)
        .eq('id', currentMedicalRecordId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error("saveMedicalRecordMutation: Erro ao atualizar medical_records:", error);
        throw error;
      }
      console.log("saveMedicalRecordMutation: Medical record updated successfully with PDF URL:", data.medical_record_pdf_url);
      return data;
    },
    onSuccess: async (data) => { // 'data' here is the updated medical record from Supabase
      queryClient.invalidateQueries({ queryKey: ['medicalRecord', appointmentId, userId] });
      queryClient.invalidateQueries({ queryKey: ['appointments', userId] });
      queryClient.invalidateQueries({ queryKey: ['historyAppointments', userId] });
      showSuccess("Prontuário salvo com sucesso!");

      if (isAttemptingFinalize) {
        // Check if there are prescriptions to generate a PDF for
        if (data.prescriptions && data.prescriptions.length > 0) {
          console.log("ConsultationPage: Finalizing with prescriptions, generating recipe PDF...");
          try {
            await generateAndSaveRecipePdfMutation.mutateAsync({ prescriptions: data.prescriptions, shouldOpenPreview: false });
            console.log("ConsultationPage: Recipe PDF generated and saved. Now finalizing appointment.");
            finalizeAppointmentMutation.mutate(appointmentId!);
          } catch (recipeError: any) {
            console.error("ConsultationPage: Error generating recipe PDF during finalization:", recipeError);
            showError(`Erro ao gerar receita durante a finalização: ${recipeError.message}`);
            setIsAttemptingFinalize(false); // Stop the finalization process
          }
        } else {
          console.log("ConsultationPage: Finalizing without prescriptions. Directly finalizing appointment.");
          finalizeAppointmentMutation.mutate(appointmentId!);
        }
      }
      setIsAttemptingFinalize(false); // Reset flag after processing
    },
    onError: (err) => {
      console.error("Error saving medical record:", err);
      showError(`Erro ao salvar prontuário: ${err.message}`);
      setIsAttemptingFinalize(false);
    },
  });

  // NOVO: Mutação para adicionar um débito ao animal
  const addAnimalDebitMutation = useMutation({
    mutationFn: async (debitData: AddAnimalDebitFormValues) => {
      if (!userId || !appointmentId || !appointment?.pet_id) {
        throw new Error("User, Appointment, or Pet ID not available.");
      }
      const { data, error } = await supabase
        .from('animal_debits')
        .insert({
          user_id: userId,
          pet_id: appointment.pet_id,
          appointment_id: appointmentId,
          description: debitData.description,
          amount: debitData.amount,
          is_paid: false, // Sempre inicia como não pago
          transaction_id: null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animalDebits', appointmentId, userId] });
      showSuccess("Débito adicionado ao animal com sucesso!");
      setIsAddAnimalDebitDialogOpen(false);
    },
    onError: (err) => {
      showError(`Erro ao adicionar débito: ${err.message}`);
    },
  });

  // NOVO: Mutação para marcar um débito como pago
  const markDebitAsPaidMutation = useMutation({
    mutationFn: async (debitId: string) => {
      if (!userId || !organizationId) {
        throw new Error("User or Organization ID not available.");
      }

      // 1. Fetch the debit details
      const { data: debitToPay, error: fetchDebitError } = await supabase
        .from('animal_debits')
        .select('*')
        .eq('id', debitId)
        .eq('user_id', userId)
        .single();

      if (fetchDebitError || !debitToPay) {
        throw fetchDebitError || new Error("Débito não encontrado.");
      }

      if (debitToPay.is_paid) {
        throw new Error("Este débito já foi pago.");
      }

      // 2. Create a new transaction
      const now = new Date();
      const transactionDate = format(now, "yyyy-MM-dd");
      const transactionTime = format(now, "HH:mm");

      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          organization_id: organizationId,
          description: `Pagamento de débito: ${debitToPay.description} (Animal: ${appointment?.pet_name})`,
          type: "Entrada",
          amount: debitToPay.amount,
          date: transactionDate,
          time: transactionTime,
          payment_method: "Dinheiro", // Default to cash, could be expanded
        })
        .select('id')
        .single();

      if (transactionError || !transactionData) {
        throw transactionError || new Error("Falha ao criar a transação de pagamento.");
      }

      const transactionId = transactionData.id;

      // 3. Update the animal debit to mark as paid and link to transaction
      const { data: updatedDebit, error: updateDebitError } = await supabase
        .from('animal_debits')
        .update({
          is_paid: true,
          transaction_id: transactionId,
        })
        .eq('id', debitId)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateDebitError) {
        // If updating debit fails, try to roll back the transaction
        await supabase.from('transactions').delete().eq('id', transactionId);
        throw updateDebitError;
      }

      return updatedDebit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animalDebits', appointmentId, userId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      showSuccess("Débito marcado como pago e transação registrada!");
    },
    onError: (err: any) => {
      showError(`Erro ao marcar débito como pago: ${err.message}`);
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
    generateAndSaveRecipePdfMutation.mutate({ prescriptions, shouldOpenPreview: true });
  };

  const handleConfirmRecipePdfDownload = (filename: string, downloadUrl: string) => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showSuccess("PDF da receita baixado com sucesso!");
      setIsRecipePdfPreviewDialogOpen(false);
    }
  };

  const handleOpenMedicalRecordPdfPreviewDialog = () => {
    if (medicalRecord?.medical_record_pdf_url) {
      setMedicalRecordPdfUrl(medicalRecord.medical_record_pdf_url);
      setMedicalRecordPdfFilename(`Prontuario_${appointment?.pet_name}_${format(parseISO(appointment?.date || new Date().toISOString()), 'yyyyMMdd')}.pdf`);
      setIsMedicalRecordPdfPreviewDialogOpen(true);
    } else {
      showError("Nenhum PDF de prontuário disponível para esta consulta.");
    }
  };

  const handleConfirmMedicalRecordPdfDownload = (filename: string, downloadUrl: string) => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showSuccess("PDF do prontuário baixado com sucesso!");
    setIsMedicalRecordPdfPreviewDialogOpen(false);
  };

  const handleAddAnimalDebit = (data: AddAnimalDebitFormValues) => {
    addAnimalDebitMutation.mutate(data);
  };

  const handleMarkDebitAsPaid = (debitId: string) => {
    markDebitAsPaidMutation.mutate(debitId);
  };

  if (isLoading || isLoadingMedicalRecord || isLoadingClients || isLoadingPets || isLoadingVeterinarians || isLoadingProducts || isLoadingAnimalDebits) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando detalhes da consulta...</p>
      </div>
    );
  }

  if (error || medicalRecordError || clientsError || petsError || veterinariansError || productsError || animalDebitsError) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Erro ao carregar dados: {error?.message || medicalRecordError?.message || clientsError?.message || petsError?.message || veterinariansError?.message || productsError?.message || animalDebitsError?.message}</p>
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

      {/* Seção de Débitos do Animal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <ReceiptText className="mr-2 h-5 w-5" /> Débitos do Animal
          </CardTitle>
          <Button onClick={() => setIsAddAnimalDebitDialogOpen(true)} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Débito
          </Button>
        </CardHeader>
        <CardContent>
          {animalDebits.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhum débito registrado para este animal nesta consulta.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {animalDebits.map((debit) => (
                    <TableRow key={debit.id} className={cn(debit.is_paid && "bg-green-50/50 dark:bg-green-900/20")}>
                      <TableCell className="font-medium">{debit.description}</TableCell>
                      <TableCell>R$ {debit.amount.toFixed(2).replace('.', ',')}</TableCell>
                      <TableCell>
                        <Badge variant={debit.is_paid ? "default" : "destructive"} className={cn(debit.is_paid ? "bg-green-500" : "bg-orange-500")}>
                          {debit.is_paid ? "Pago" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {!debit.is_paid && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkDebitAsPaid(debit.id)}
                            disabled={markDebitAsPaidMutation.isPending}
                          >
                            <DollarSign className="mr-2 h-4 w-4" /> Marcar como Pago
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
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
        {medicalRecord?.medical_record_pdf_url && (
          <Button onClick={handleOpenMedicalRecordPdfPreviewDialog} variant="outline">
            <FileText className="mr-2 h-4 w-4" /> Ver Prontuário
          </Button>
        )}
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
          allClients={allClients}
          allPets={allPets}
          allVeterinarians={allVeterinarians}
        />
      )}

      <AddAnimalDebitDialog
        isOpen={isAddAnimalDebitDialogOpen}
        onClose={() => setIsAddAnimalDebitDialogOpen(false)}
        onSubmit={handleAddAnimalDebit}
        isSubmitting={addAnimalDebitMutation.isPending}
        products={products}
      />

      <PdfPreviewDialog
        isOpen={isRecipePdfPreviewDialogOpen}
        onClose={() => setIsRecipePdfPreviewDialogOpen(false)}
        pdfBlob={recipePdfBlob}
        pdfUrl={recipePdfUrl}
        filename={recipePdfFilename}
        onConfirmDownload={handleConfirmRecipePdfDownload}
      />

      <PdfPreviewDialog
        isOpen={isMedicalRecordPdfPreviewDialogOpen}
        onClose={() => setIsMedicalRecordPdfPreviewDialogOpen(false)}
        pdfBlob={medicalRecordPdfBlob}
        pdfUrl={medicalRecordPdfUrl}
        filename={medicalRecordPdfFilename}
        onConfirmDownload={handleConfirmMedicalRecordPdfDownload}
      />
    </div>
  );
};

export default ConsultationPage;