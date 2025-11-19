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
import { TeamMember } from '@/pages/Veterinarios'; // Importar TeamMember

interface ForwardToInternmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  allClients: Client[];
  allPets: Pet[];
  allVeterinarians: TeamMember[];
  onInternmentSuccess: () => void; // NOVO: Callback para sucesso
}

const ForwardToInternmentDialog: React.FC<ForwardToInternmentDialogProps> = ({
  isOpen,
  onClose,
  appointment,
  allClients,
  allPets,
  allVeterinarians,
  onInternmentSuccess, // NOVO
}) => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;

  const addPatientMutation = useMutation({
    mutationFn: async (newPatientData: InternmentFormValues) => {
      if (!userId) throw new Error("User not authenticated.");

      const client = allClients.find(c => c.id === newPatientData.selectedClientId);
      const pet = allPets.find(p => p.id === newPatientData.selectedPetId);
      const veterinarian = allVeterinarians.find(v => `${v.first_name} ${v.last_name}` === newPatientData.veterinarian);

      if (!client || !pet) {
        throw new Error("Tutor ou animal selecionado não encontrado.");
      }
      if (!veterinarian) {
        throw new Error("Veterinário responsável não encontrado.");
      }

      console.log("ForwardToInternmentDialog: Attempting to insert new patient:", newPatientData);
      const { data, error } = await supabase
        .from('interned_patients')
        .insert({
          user_id: userId,
          client_id: client.id,
          pet_id: pet.id,
          bay_name: newPatientData.bayName,
          pet_name: pet.name,
          owner_name: client.name,
          reason: newPatientData.reason,
          admission_date: format(newPatientData.admissionDate, "yyyy-MM-dd"),
          expected_discharge_date: newPatientData.expectedDischargeDate ? format(newPatientData.expectedDischargeDate, "yyyy-MM-dd") : null,
          veterinarian: `${veterinarian.first_name} ${veterinarian.last_name}`,
          status: "Em Observação",
          species: pet.species,
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
      onInternmentSuccess(); // NOVO: Chama o callback de sucesso
      onClose();
    },
    onError: (error) => {
      showError(`Erro ao encaminhar paciente para internação: ${error.message}`);
    },
  });

  const initialClient = allClients.find(c => c.name === appointment.client_name);
  const initialPet = allPets.find(p => p.name === appointment.pet_name && p.ownerId === initialClient?.id);

  const initialInternmentData: Partial<InternmentFormValues> = {
    selectedClientId: initialClient?.id,
    selectedPetId: initialPet?.id,
    petName: appointment.pet_name,
    ownerName: appointment.client_name,
    species: appointment.species,
    veterinarian: appointment.veterinarian,
    admissionDate: new Date(),
    risk: "Sem risco",
    bayName: "",
    reason: "",
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
          allClients={allClients}
          allPets={allPets}
          allVeterinarians={allVeterinarians}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ForwardToInternmentDialog;