export type RiskLevel = "Sem risco" | "Baixo" | "Médio" | "Alto" | "Emergência";

export interface InternedPatient {
  id: string;
  bayName: string;
  petName: string;
  ownerName: string;
  reason: string;
  admissionDate: string;
  expectedDischargeDate?: string;
  veterinarian: string;
  status: "Em Observação" | "Estável" | "Crítico" | "Alta" | "Óbito";
  species: string;
  risk: RiskLevel;
}

export interface ExecutionAction {
  id: string;
  patientId: string;
  patientName: string;
  date: string; // Data em que a ação deve ser executada (yyyy-MM-dd)
  scheduledTime: string; // Horário agendado (HH:mm)
  type: "Medicação" | "Parâmetro" | "Alimentação" | "Outro";
  description: string;
  executedTime?: string; // Horário em que foi realmente executado
  notes?: string;
  status: "Pendente" | "Realizado" | "Atrasado";
}