"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, CalendarDays, User, Stethoscope, Search, History, CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import InternmentForm, { InternmentFormValues } from "@/components/InternmentForm";
import InternmentDetailsDialog from "@/components/InternmentDetailsDialog";
import InternmentHistoryDialog from "@/components/InternmentHistoryDialog";
import ExecutionMapTable from "@/components/ExecutionMapTable";
import { format, isSameDay, parseISO, isBefore, isAfter, isEqual, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AddPatientActionDialog from "@/components/AddPatientActionDialog";
import ConfirmPatientActionsDialog from "@/components/ConfirmPatientActionsDialog";
import ExecutionMapLegend from "@/components/ExecutionMapLegend";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/context/UserContext";
import { showError, showSuccess } from "@/utils/toast";

type RiskLevel = "Sem risco" | "Baixo" | "Médio" | "Alto" | "Emergência";

export interface InternedPatient {
  id: string;
  user_id: string;
  bay_name: string;
  pet_name: string;
  owner_name: string;
  reason: string;
  admission_date: string;
  expected_discharge_date?: string | null;
  veterinarian: string;
  status: "Em Observação" | "Estável" | "Crítico" | "Alta" | "Óbito";
  species: string;
  risk: RiskLevel;
  created_at: string;
}

export interface PatientAction {
  id: string;
  user_id: string;
  patient_id: string;
  date: string; // YYYY-MM-DD
  hour: string; // HH
  description: string;
  type: "Medicação" | "Alimentação" | "Observação" | "Outro";
  is_completed: boolean;
  frequency?: "SID" | "BID" | "TID" | "QID" | "Outro" | null;
  quantity?: string | null;
  route?: string | null;
  created_at: string;
}

const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
};

const speciesColorMap: { [key: string]: string } = {
  Cachorro: "text-sidebar-item-bg-1",
  Gato: "text-sidebar-item-bg-4",
  Pássaro: "text-sidebar-item-bg-3",
  Roedor: "text-sidebar-item-bg-7",
  Peixe: "text-sidebar-item-bg-5",
  Outros: "text-sidebar-item-bg-9",
};

const riskColorMap: Record<RiskLevel, string> = {
  "Sem risco": "bg-blue-500",
  "Baixo": "bg-green-500",
  "Médio": "bg-yellow-500",
  "Alto": "bg-orange-500",
  "Emergência": "bg-red-500",
};

const statusBadgeColorMap: Record<InternedPatient["status"], string> = {
  "Em Observação": "bg-blue-500",
  "Estável": "bg-green-500",
  "Crítico": "bg-red-500",
  "Alta": "bg-green-500",
  "Óbito": "bg-red-500",
};

const Internacao = () => {
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();
  const userId = appUser?.id; // Assuming user ID is available from context

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<InternedPatient | null>(null);
  const [activeTab, setActiveTab] = useState<string>("pacientes-internados");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [patientSearchTerm, setPatientSearchTerm] = useState<string>("");

  const [isAddActionDialogOpen, setIsAddActionDialogOpen] = useState(false);
  const [actionPatientId, setActionPatientId] = useState<string | null>(null);
  const [actionPatientName, setActionPatientName] = useState<string | null>(null);
  const [actionDate, setActionDate] = useState<Date | null>(null);
  const [actionHour, setActionHour] = useState<string | null>(null);
  const [allActionsForCurrentPatient, setAllActionsForCurrentPatient] = useState<PatientAction[]>([]);

  const [isConfirmActionsDialogOpen, setIsConfirmActionsDialogOpen] = useState(false);
  const [confirmActionsPatientId, setConfirmActionsPatientId] = useState<string | null>(null);
  const [confirmActionsPatientName, setConfirmActionsPatientName] = useState<string | null>(null);
  const [confirmActionsDate, setConfirmActionsDate] = useState<Date | null>(null);
  const [confirmActionsHour, setConfirmActionsHour] = useState<string | null>(null);
  const [confirmActionsForSlot, setConfirmActionsForSlot] = useState<PatientAction[]>([]);

  // Fetch interned patients
  const { data: internedPatients = [], isLoading: isLoadingPatients, error: patientsError, refetch: refetchInternedPatients } = useQuery<InternedPatient[]>({
    queryKey: ['interned_patients', userId],
    queryFn: async () => {
      if (!userId) return [];
      console.log("Internacao.tsx: Fetching interned_patients (excluding Alta/Óbito) from Supabase for user:", userId);
      const { data, error } = await supabase
        .from('interned_patients')
        .select('*')
        .eq('user_id', userId)
        .neq('status', 'Alta') // CORREÇÃO AQUI: Usando neq
        .neq('status', 'Óbito'); // CORREÇÃO AQUI: Usando neq

      if (error) {
        console.error("Internacao.tsx: Error fetching interned_patients:", error);
        throw error;
      }
      console.log("Internacao.tsx: Supabase returned for interned_patients:", data);
      data.forEach(p => console.log(`Internacao.tsx: Patient ${p.id} - Status: '${p.status}'`));
      return data;
    },
    enabled: !!userId,
  });

  // Fetch history patients
  const { data: historyPatients = [], isLoading: isLoadingHistory, error: historyError } = useQuery<InternedPatient[]>({
    queryKey: ['history_patients', userId],
    queryFn: async () => {
      if (!userId) return [];
      console.log("Internacao.tsx: Fetching history_patients from Supabase...");
      const { data, error } = await supabase
        .from('interned_patients')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['Alta', 'Óbito']); // Only discharged/deceased patients
      if (error) {
        console.error("Internacao.tsx: Error fetching history_patients:", error);
        throw error;
      }
      console.log("Internacao.tsx: history_patients fetched:", data);
      return data;
    },
    enabled: !!userId,
  });

  // Fetch patient actions
  const { data: patientActions = [], isLoading: isLoadingActions, error: actionsError } = useQuery<PatientAction[]>({
    queryKey: ['patient_actions', userId],
    queryFn: async () => {
      if (!userId) return [];
      console.log("Internacao.tsx: Fetching patient_actions from Supabase...");
      const { data, error } = await supabase
        .from('patient_actions')
        .select('*')
        .eq('user_id', userId);
      if (error) {
        console.error("Internacao.tsx: Error fetching patient_actions:", error);
        throw error;
      }
      console.log("Internacao.tsx: patient_actions fetched:", data);
      return data;
    },
    enabled: !!userId,
  });

  // Mutation for adding a new patient
  const addPatientMutation = useMutation({
    mutationFn: async (newPatientData: InternmentFormValues) => {
      if (!userId) throw new Error("User not authenticated.");
      console.log("Internacao.tsx: Attempting to insert new patient:", newPatientData);
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
        console.error("Internacao.tsx: Error inserting new patient:", error);
        throw error;
      }
      console.log("Internacao.tsx: New patient inserted successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interned_patients', userId] });
      showSuccess("Paciente internado com sucesso!");
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      showError(`Erro ao internar paciente: ${error.message}`);
    },
  });

  // Mutation for updating a patient
  const updatePatientMutation = useMutation({
    mutationFn: async (updatedPatient: InternedPatient) => {
      if (!userId) throw new Error("User not authenticated.");
      console.log("Internacao.tsx: Attempting to update patient in DB:", updatedPatient);
      const { data, error } = await supabase
        .from('interned_patients')
        .update({
          bay_name: updatedPatient.bay_name,
          pet_name: updatedPatient.pet_name,
          owner_name: updatedPatient.owner_name,
          reason: updatedPatient.reason,
          admission_date: updatedPatient.admission_date,
          expected_discharge_date: updatedPatient.expected_discharge_date,
          veterinarian: updatedPatient.veterinarian,
          status: updatedPatient.status,
          species: updatedPatient.species,
          risk: updatedPatient.risk,
        })
        .eq('id', updatedPatient.id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) {
        console.error("Internacao.tsx: Error updating patient in DB:", error);
        throw error;
      }
      console.log("Internacao.tsx: Patient updated successfully in DB (response):", data);
      return data;
    },
    onSuccess: async (data) => {
      console.log("Internacao.tsx: updatePatientMutation onSuccess - Data received:", data);
      console.log("Internacao.tsx: Updated patient status in onSuccess:", data.status);
      
      // Invalidate and refetch both queries to ensure they get fresh data from Supabase
      await queryClient.invalidateQueries({ queryKey: ['interned_patients', userId] });
      await queryClient.refetchQueries({ queryKey: ['interned_patients', userId] });
      console.log("Internacao.tsx: Invalidated and refetched interned_patients query.");

      await queryClient.invalidateQueries({ queryKey: ['history_patients', userId] });
      await queryClient.refetchQueries({ queryKey: ['history_patients', userId] });
      console.log("Internacao.tsx: Invalidated and refetched history_patients query.");

      showSuccess("Paciente atualizado com sucesso!");
      setIsDetailsDialogOpen(false); // Close dialog AFTER cache update
    },
    onError: (error) => {
      console.error("Internacao.tsx: updatePatientMutation onError:", error);
      showError(`Erro ao atualizar paciente: ${error.message}`);
    },
  });

  // Mutation for saving all patient actions (inserting new, updating existing, deleting removed)
  const saveAllActionsMutation = useMutation({
    mutationFn: async (actionsToSave: PatientAction[]) => {
      if (!userId) throw new Error("User not authenticated.");
      console.log("saveAllActionsMutation: actionsToSave received:", actionsToSave);

      const existingActionsForPatient = allActionsForCurrentPatient.filter(a => a.patient_id === actionPatientId);
      const newActions = actionsToSave.filter(action => !existingActionsForPatient.some(ea => ea.id === action.id));
      const updatedActions = actionsToSave.filter(action => existingActionsForPatient.some(ea => ea.id === action.id));
      const deletedActions = existingActionsForPatient.filter(ea => !actionsToSave.some(action => action.id === ea.id));

      console.log("saveAllActionsMutation: New actions to insert:", newActions);
      console.log("saveAllActionsMutation: Existing actions to update:", updatedActions);
      console.log("saveAllActionsMutation: Actions to delete:", deletedActions);

      const promises = [];

      if (newActions.length > 0) {
        promises.push(supabase.from('patient_actions').insert(newActions.map(action => ({
          ...action,
          user_id: userId,
          frequency: action.frequency || null, // Ensure null for optional fields
          quantity: action.quantity || null,
          route: action.route || null,
        }))));
      }

      for (const action of updatedActions) {
        promises.push(supabase.from('patient_actions').update({
          description: action.description,
          type: action.type,
          is_completed: action.is_completed,
          frequency: action.frequency || null,
          quantity: action.quantity || null,
          route: action.route || null,
        }).eq('id', action.id).eq('user_id', userId));
      }

      if (deletedActions.length > 0) {
        promises.push(supabase.from('patient_actions').delete().in('id', deletedActions.map(a => a.id)).eq('user_id', userId));
      }

      const results = await Promise.all(promises);
      for (const result of results) {
        if (result.error) {
          console.error("saveAllActionsMutation: Error in one of the operations:", result.error);
          throw result.error;
        }
      }
      console.log("saveAllActionsMutation: All operations completed successfully.");
      return results;
    },
    onSuccess: () => {
      console.log("saveAllActionsMutation: onSuccess - Invalidating patient_actions query.");
      queryClient.invalidateQueries({ queryKey: ['patient_actions', userId] });
      showSuccess("Ações do paciente salvas com sucesso!");
      setIsAddActionDialogOpen(false);
    },
    onError: (error) => {
      console.error("saveAllActionsMutation: onError - Error saving patient actions:", error);
      showError(`Erro ao salvar ações do paciente: ${error.message}`);
    },
  });

  // Mutation for updating completion status of actions
  const updateActionsCompletionMutation = useMutation({
    mutationFn: async (actionsToUpdate: PatientAction[]) => {
      if (!userId) throw new Error("User not authenticated.");
      console.log("updateActionsCompletionMutation: actionsToUpdate received:", actionsToUpdate);
      const promises = actionsToUpdate.map(action =>
        supabase
          .from('patient_actions')
          .update({ is_completed: action.is_completed })
          .eq('id', action.id)
          .eq('user_id', userId)
      );
      const results = await Promise.all(promises);
      for (const result of results) {
        if (result.error) {
          console.error("updateActionsCompletionMutation: Error in one of the completion updates:", result.error);
          throw result.error;
        }
      }
      console.log("updateActionsCompletionMutation: All completion updates completed successfully.");
      return results;
    },
    onSuccess: () => {
      console.log("updateActionsCompletionMutation: onSuccess - Invalidating patient_actions query.");
      queryClient.invalidateQueries({ queryKey: ['patient_actions', userId] });
      showSuccess("Status das ações atualizado!");
      setIsConfirmActionsDialogOpen(false);
    },
    onError: (error) => {
      console.error("updateActionsCompletionMutation: onError - Error updating actions completion:", error);
      showError(`Erro ao atualizar status das ações: ${error.message}`);
    },
  });

  // NEW: Mutation for clearing history patients
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User not authenticated.");
      console.log("Internacao.tsx: Attempting to clear history patients for user:", userId);
      const { error } = await supabase
        .from('interned_patients')
        .delete()
        .eq('user_id', userId)
        .in('status', ['Alta', 'Óbito']);
      if (error) {
        console.error("Internacao.tsx: Error clearing history patients:", error);
        throw error;
      }
      console.log("Internacao.tsx: History patients cleared successfully.");
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history_patients', userId] });
      showSuccess("Histórico de pacientes internados limpo com sucesso!");
      setIsHistoryDialogOpen(false); // Fecha o diálogo após a limpeza
    },
    onError: (error) => {
      showError(`Erro ao limpar histórico: ${error.message}`);
    },
  });

  const handleAddInternment = (data: InternmentFormValues) => {
    addPatientMutation.mutate(data);
  };

  const handleUpdateInternment = (updatedPatient: InternedPatient) => {
    console.log("Internacao.tsx: InternmentDetailsDialog: Calling onUpdate with updatedPatient:", updatedPatient); // Log para verificar
    updatePatientMutation.mutate(updatedPatient);
  };

  const handleCardClick = (patient: InternedPatient) => {
    setSelectedPatient(patient);
    setIsDetailsDialogOpen(true);
  };

  const patientsForExecutionMap = useMemo(() => {
    return internedPatients;
  }, [internedPatients]);

  const handlePreviousDay = () => {
    setSelectedDate((prevDate) => subDays(prevDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate((prevDate) => addDays(prevDate, 1));
  };

  const filteredInternedPatients = internedPatients.filter(patient =>
    patient.pet_name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.owner_name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.bay_name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.veterinarian.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.species.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.status.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.risk.toLowerCase().includes(patientSearchTerm.toLowerCase())
  );

  console.log("Internacao.tsx: filteredInternedPatients for rendering:", filteredInternedPatients);

  const openAddEditActionDialog = (
    patientId: string,
    patientName: string,
    date: Date,
    hour: string,
  ) => {
    setActionPatientId(patientId);
    setActionPatientName(patientName);
    setActionDate(date);
    setActionHour(hour);
    const actionsForThisPatient = patientActions.filter(
      (action) => action.patient_id === patientId
    );
    setAllActionsForCurrentPatient(actionsForThisPatient);
    setIsAddActionDialogOpen(true);
  };

  const handleSaveAllPatientActions = (updatedActionsForPatient: PatientAction[]) => {
    console.log("handleSaveAllPatientActions: Calling saveAllActionsMutation with:", updatedActionsForPatient);
    saveAllActionsMutation.mutate(updatedActionsForPatient);
  };

  const handleOpenConfirmActionsDialog = (
    patientId: string,
    patientName: string,
    date: Date,
    hour: string,
    actions: PatientAction[]
  ) => {
    setConfirmActionsPatientId(patientId);
    setConfirmActionsPatientName(patientName);
    setConfirmActionsDate(date);
    setConfirmActionsHour(hour);
    setConfirmActionsForSlot(actions);
    setIsConfirmActionsDialogOpen(true);
  };

  const handleConfirmPatientActions = (updatedActions: PatientAction[]) => {
    console.log("handleConfirmPatientActions: Calling updateActionsCompletionMutation with:", updatedActions);
    updateActionsCompletionMutation.mutate(updatedActions);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "pacientes-internados":
        return "Pacientes Internados";
      case "mapa-execucao":
        return "Mapa de Execução";
      default:
        return "Internação";
    }
  };

  if (isLoadingPatients || isLoadingHistory || isLoadingActions) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Carregando dados de internação...</p>
      </div>
    );
  }

  if (patientsError || historyError || actionsError) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <p>Erro ao carregar dados: {patientsError?.message || historyError?.message || actionsError?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">{getPageTitle()}</h2>
        <div className="flex space-x-2">
          {activeTab === "pacientes-internados" && (
            <>
              <InternmentHistoryDialog
                isOpen={isHistoryDialogOpen}
                onClose={() => setIsHistoryDialogOpen(false)}
                historyPatients={historyPatients}
                onClearHistory={() => clearHistoryMutation.mutate()}
                isClearingHistory={clearHistoryMutation.isPending}
              />
              <Button className="font-bold" onClick={() => setIsHistoryDialogOpen(true)}>
                <History className="mr-2 h-4 w-4" /> Ver Histórico
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="font-bold">
                    <PlusCircle className="mr-2 h-4 w-4" /> Internar Paciente
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4">
                  <DialogHeader>
                    <DialogTitle>Internar Novo Paciente</DialogTitle>
                  </DialogHeader>
                  <InternmentForm onSubmit={handleAddInternment} onCancel={() => setIsAddDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </>
          )}
          {activeTab === "mapa-execucao" && (
            <div className="flex items-center space-x-2">
              <Button variant="default" size="icon" onClick={handlePreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(day) => setSelectedDate(day || new Date())}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <Button variant="default" size="icon" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="pacientes-internados" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Pacientes Internados</TabsTrigger>
          <TabsTrigger value="mapa-execucao" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-lg py-2 font-bold">Mapa de Execução</TabsTrigger>
        </TabsList>

        <TabsContent value="pacientes-internados" className="mt-4">
          <div className="mt-8">
            <div className="flex flex-wrap gap-4 mb-6">
              {Object.entries(riskColorMap).map(([risk, colorClass]) => (
                <div key={risk} className="flex items-center space-x-2">
                  <span className={cn("h-4 w-4 rounded-full", colorClass)}></span>
                  <span className="text-sm text-muted-foreground">{risk}</span>
                </div>
              ))}
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar pacientes internados..."
                className="pl-9"
                value={patientSearchTerm}
                onChange={(e) => setPatientSearchTerm(e.target.value)}
              />
            </div>
            {filteredInternedPatients.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredInternedPatients.map((patient) => {
                  const IconComponent = speciesIconMap[patient.species] || MoreHorizontal;
                  const speciesTextColorClass = speciesColorMap[patient.species] || "text-muted-foreground";
                  const riskStripeColorClass = riskColorMap[patient.risk as RiskLevel];

                  return (
                    <li
                      key={patient.id}
                      className="relative p-3 border rounded-md bg-white dark:bg-gray-800 shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleCardClick(patient)}
                    >
                      <div className={cn("absolute top-0 right-0 h-full w-4 rounded-r-md", riskStripeColorClass)}></div>

                      <p className="font-bold text-lg flex items-center">
                        <IconComponent className={cn("h-6 w-6 mr-2", speciesTextColorClass)} />
                        {patient.pet_name}
                      </p>
                      <p className="text-base text-muted-foreground"><span className="font-bold">Tutor:</span> {patient.owner_name}</p>
                      <p className="text-base text-muted-foreground"><span className="font-bold">Motivo:</span> {patient.reason}</p>
                      <p className="text-base text-muted-foreground"><span className="font-bold">Status:</span> {patient.status}</p>
                      <p className="text-base text-muted-foreground"><span className="font-bold">Risco:</span> {patient.risk}</p>
                      <p className="text-base text-muted-foreground"><span className="font-bold">Entrada:</span> {patient.admission_date}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nenhum paciente internado no momento.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="mapa-execucao" className="mt-4">
          <ExecutionMapLegend />
          <div className="p-4 border rounded-md bg-background space-y-4 mt-4">
            <ExecutionMapTable
              patients={patientsForExecutionMap}
              selectedDate={selectedDate}
              patientActions={patientActions}
              onAddActionClick={openAddEditActionDialog}
              onOpenConfirmActionsDialog={handleOpenConfirmActionsDialog}
            />
          </div>
        </TabsContent>
      </Tabs>

      <InternmentDetailsDialog
        patient={selectedPatient}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        onUpdate={handleUpdateInternment}
      />

      <InternmentHistoryDialog
        isOpen={isHistoryDialogOpen}
        onClose={() => setIsHistoryDialogOpen(false)}
        historyPatients={historyPatients}
        onClearHistory={() => clearHistoryMutation.mutate()}
        isClearingHistory={clearHistoryMutation.isPending}
      />

      {isAddActionDialogOpen && actionPatientId && actionPatientName && actionDate && actionHour && (
        <AddPatientActionDialog
          isOpen={isAddActionDialogOpen}
          onClose={() => setIsAddActionDialogOpen(false)}
          onSaveAllActions={handleSaveAllPatientActions}
          patientId={actionPatientId}
          patientName={actionPatientName}
          date={actionDate}
          initialHour={actionHour}
          allActionsForCurrentPatient={allActionsForCurrentPatient}
        />
      )}

      {isConfirmActionsDialogOpen && confirmActionsPatientId && confirmActionsPatientName && confirmActionsDate && confirmActionsHour && (
        <ConfirmPatientActionsDialog
          isOpen={isConfirmActionsDialogOpen}
          onClose={() => setIsConfirmActionsDialogOpen(false)}
          onConfirmActions={handleConfirmPatientActions}
          patientName={confirmActionsPatientName}
          date={confirmActionsDate}
          hour={confirmActionsHour}
          actionsForSlot={confirmActionsForSlot}
          onEditActionsClick={(pId, pName, dt, hr) => {
            setIsConfirmActionsDialogOpen(false);
            openAddEditActionDialog(pId, pName, dt, hr);
          }}
          patientId={confirmActionsPatientId}
        />
      )}
    </div>
  );
};

export default Internacao;