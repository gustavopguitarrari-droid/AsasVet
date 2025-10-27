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

interface ForwardToInternmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
}

const ForwardToInternmentDialog: React.FC<ForwardToInternmentDialogProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id;

  const addPatientMutation = useMutation({
    mutationFn: async (newPatientData: InternmentFormValues) => {
      if (!userId) throw new Error("User not authenticated.");
      console.log("ForwardToInternmentDialog: Attempting to insert new patient:", newPatientData);
      const { data, error } = await supabase
        .from('interned_patients')
        .insert({
          user_id: userId,
          bay_name: newPatientData.bayName,
          pet_name: newPatientData.petName,
          owner_name: newPatientData.ownerName,
          reason: newPatientData.reason,
          admission_date: format(newPatientData.admissionDate, "yyyy-MM-dd"),
          expected_discharge_date: newPatientData.expectedDischargeDate ? format(newPatientData.expectedDischargeDate, "yyyy-MM-dd") : null,
          veterinarian: newPatientData.veterinarian,
          status: "Em Observação",
          species: newPatientData.species,
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

  const initialInternmentData: Partial<InternmentFormValues> = {
    petName: appointment.pet_name,
    ownerName: appointment.client_name,
    species: appointment.species,
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
        />
      </DialogContent>
    </Dialog>
  );
};

export default ForwardToInternmentDialog;