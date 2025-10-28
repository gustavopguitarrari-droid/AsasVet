"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Hospital, ArrowLeft } from 'lucide-react';
import InternmentForm, { InternmentFormValues } from './InternmentForm';
import { Appointment } from '@/pages/Appointments';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/context/UserContext';
import { showError, showSuccess } from '@/utils/toast';
import { format } from 'date-fns';
import { Client, Pet } from '@/types/cadastro'; // Importar Client e Pet

interface ForwardToInternmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  allClients: Client[]; // NOVO: Passar todos os clientes
  allPets: Pet[];       // NOVO: Passar todos os pets
}

const ForwardToInternmentDialog: React.FC<ForwardToInternmentDialogProps> = ({
  isOpen,
  onClose,
  appointment,
  allClients, // NOVO
  allPets,    // NOVO
}) => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;

  const addPatientMutation = useMutation({
    mutationFn: async (newPatientData: InternmentFormValues) => {
      if (!userId) throw new Error("User not authenticated.");

      const client = allClients.find(c => c.id === newPatientData.selectedClientId);
      const pet = allPets.find(p => p.id === newPatientData.selectedPetId);

      if (!client || !pet) {
        throw new Error("Tutor ou animal selecionado não encontrado.");
      }

      console.log("ForwardToInternmentDialog: Attempting to insert new patient:", newPatientData);
      const { data, error } = await supabase
        .from('interned_patients')
        .insert({
          user_id: userId,
          client_id: client.id, // NOVO: Adiciona client_id
          pet_id: pet.id,       // NOVO: Adiciona pet_id
          bay_name: newPatientData.bayName,
          pet_name: pet.name, // Usa o nome do pet do objeto pet
          owner_name: client.name, // Usa o nome do cliente do objeto client
          reason: newPatientData.reason,
          admission_date: format(newPatientData.admissionDate, "yyyy-MM-dd"),
          expected_discharge_date: newPatientData.expectedDischargeDate ? format(newPatientData.expectedDischargeDate, "yyyy-MM-dd") : null,
          veterinarian: newPatientData.veterinarian,
          status: "Em Observação",
          species: pet.species, // Usa a espécie do pet do objeto pet
          risk: newPatientData.risk,
        })
        .select()
        .single();
      if (error) {
        console.error("ForwardToInternmentDialog: Error inserting new patient:", error);
        throw error;
      }
      console.log("ForwardToInternmentDialog: New patient inserted successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interned_patients', userId] });
      showSuccess("Paciente encaminhado para internação com sucesso!");
      onClose();
    },
    onError: (error) => {
      showError(`Erro ao encaminhar paciente para internação: ${error.message}`);
    },
  });

  // Tenta encontrar o cliente e o pet da consulta para preencher os valores iniciais
  const initialClient = allClients.find(c => c.name === appointment.client_name);
  const initialPet = allPets.find(p => p.name === appointment.pet_name && p.ownerId === initialClient?.id);

  const initialInternmentData: Partial<InternmentFormValues> = {
    selectedClientId: initialClient?.id,
    selectedPetId: initialPet?.id,
    petName: appointment.pet_name, // Mantido para fallback ou exibição inicial
    ownerName: appointment.client_name, // Mantido para fallback ou exibição inicial
    species: appointment.species, // Mantido para fallback ou exibição inicial
    veterinarian: appointment.veterinarian,
    admissionDate: new Date(), // Default to today
    risk: "Sem risco", // Default risk
    bayName: "", // User must fill
    reason: "", // User must fill
  };

  const handleSubmit = (data: InternmentFormValues) => {
    addPatientMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Hospital className="h-5 w-5 mr-2" /> Encaminhar para Internação
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes para internar {appointment.pet_name}.
          </DialogDescription>
        </DialogHeader>
        <InternmentForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialData={initialInternmentData}
          isSubmittingParent={addPatientMutation.isPending}
          allClients={allClients} // Passa todos os clientes
          allPets={allPets}     // Passa todos os pets
        />
      </DialogContent>
    </Dialog>
  );
};

export default ForwardToInternmentDialog;