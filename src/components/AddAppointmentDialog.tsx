"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AppointmentForm, { AppointmentFormValues } from "./AppointmentForm";

interface AddAppointmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AppointmentFormValues) => void;
}

const AddAppointmentDialog: React.FC<AddAppointmentDialogProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Incluir Nova Consulta</DialogTitle>
        </DialogHeader>
        <AppointmentForm onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  );
};

export default AddAppointmentDialog;