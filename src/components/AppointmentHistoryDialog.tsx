"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Search, History, CalendarCheck, CalendarX, Dog, Cat, Bird, Rabbit, Fish, MoreHorizontal, Eye, CalendarClock, FileText, Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid, differenceInSeconds } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from "@/pages/Appointments";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter as AlertDialogFooterComponent,
  AlertDialogHeader,
  AlertDialogTitle as AlertDialogTitleComponent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { generateMedicalRecordPdf } from "@/utils/generateMedicalRecordPdf";
import { MedicalRecordFormValues } from "@/components/consultation/MedicalRecordForm";
import PdfPreviewDialog from "./PdfPreviewDialog";
import { useUser } from "@/context/UserContext";
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf'; // NOVO: Importar função de PDF de receita

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
  recipe_pdf_url?: string | null; // NOVO: URL do PDF da receita
  created_at: string;
  updated_at: string;
}

interface AppointmentHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  historyAppointments: Appointment[];
  onViewDetails: (appointment: Appointment) => void;
  onClearHistory: () => void;
  isClearingHistory: boolean;
}

const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: Dog,
  Gato: Cat,
  Pássaro: Bird,
  Roedor: Rabbit,
  Peixe: Fish,
  Outros: MoreHorizontal,
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

const AppointmentHistoryDialog: React.FC<AppointmentHistoryDialogProps> = ({
  isOpen,
  onClose,
  historyAppointments,
  onViewDetails,
  onClearHistory,
  isClearingHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const queryClient = useQueryClient();
  const { user: appUser } = useUser();

  // States for PDF preview dialog
  const [isPdfPreviewDialogOpen, setIsPdfPreviewDialogOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFilename, setPdfFilename] = useState("");
  const [pdfAppointment, setPdfAppointment] = useState<Appointment | null>(null);

  // Estados para o diálogo de pré-visualização de PDF de receita
  const [isRecipePdfPreviewDialogOpen, setIsRecipePdfPreviewDialogOpen] = useState(false);
  const [recipePdfBlob, setRecipePdfBlob] = useState<Blob | null>(null);
  const [recipePdfFilename, setRecipePdfFilename] = useState("");

  // Mutation to fetch the medical record and generate the PDF
  const fetchAndGeneratePdfMutation = useMutation({
    mutationFn: async ({ appointment }: { appointment: Appointment }) => {
      // First, fetch the medical record
      const { data: medicalRecordData, error: fetchError } = await supabase
        .from('medical_records')
        .select('id, appointment_id, user_id, anamnesis, physical_exam, diagnosis, treatment, prescriptions, created_at, updated_at')
        .eq('appointment_id', appointment.id)
        .eq('user_id', appointment.user_id)
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
      console.error("Erro ao gerar PDF do histórico:", err);
      showError(`Erro ao gerar PDF: ${err.message || "Erro desconhecido"}`);
    },
  });

  // NOVO: Mutação para buscar o prontuário médico e gerar o PDF da receita
  const fetchAndGenerateRecipePdfMutation = useMutation({
    mutationFn: async ({ appointment }: { appointment: Appointment }) => {
      // First, fetch the medical record to get prescriptions
      const { data: medicalRecordData, error: fetchError } = await supabase
        .from('medical_records')
        .select('id, prescriptions')
        .eq('appointment_id', appointment.id)
        .eq('user_id', appointment.user_id)
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

      return { pdfBlob, appointment };
    },
    onSuccess: ({ pdfBlob, appointment }) => {
      setRecipePdfBlob(pdfBlob);
      setRecipePdfFilename(`Receita_${appointment.pet_name}_${format(parseISO(appointment.date), 'yyyyMMdd')}.pdf`);
      setIsRecipePdfPreviewDialogOpen(true);
    },
    onError: (err: any) => {
      console.error("Erro ao gerar PDF da receita do histórico:", err);
      showError(`Erro ao gerar receita: ${err.message || "Erro desconhecido"}`);
    },
  });

  const filteredHistory = historyAppointments.filter((appointment) =>
    appointment.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.pet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (appointment.veterinarian && appointment.veterinarian.toLowerCase().includes(searchTerm.toLowerCase())) ||
    appointment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (appointment.completion_timestamp && format(parseISO(appointment.completion_timestamp), "dd/MM/yyyy").includes(searchTerm))
  );

  // Sort by most recent creation date first
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const dateA = parseISO(a.created_at);
    const dateB = parseISO(b.created_at);
    return dateB.getTime() - dateA.getTime();
  });

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
  const handleConfirmPdfDownload = (filename: string) => {
    if (pdfBlob) {
      // Create a download link
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess("PDF do prontuário baixado com sucesso!");
      setIsPdfPreviewDialogOpen(false);
    }
  };

  const handleConfirmRecipePdfDownload = (filename: string) => {
    if (recipePdfBlob) {
      const url = URL.createObjectURL(recipePdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess("PDF da receita baixado com sucesso!");
      setIsRecipePdfPreviewDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <History className="h-5 w-5 mr-2" /> Histórico de Consultas
            </DialogTitle>
            <DialogDescription>
              Visualize todas as consultas finalizadas ou canceladas.
            </DialogDescription>
          </DialogHeader>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar no histórico (paciente, tutor, serviço, status)..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mt-4 flex-1 overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Veterinário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Finalização/Cancelamento</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Tempo de Espera</TableHead>
                  <TableHead>Receitas</TableHead> {/* NOVO: Coluna Receitas */}
                  <TableHead className="text-right">Prontuário / Receita</TableHead> {/* Alterado de 'Ações' para 'Prontuário' */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHistory.length > 0 ? (
                  sortedHistory.map((appointment) => {
                    const IconComponent = speciesIconMap[appointment.species] || MoreHorizontal;
                    const isRealizada = appointment.status === 'Realizada';
                    const isCancelada = appointment.status === 'Cancelada';

                    // Calculate Consultation Duration
                    const duration = isRealizada && appointment.start_time && appointment.completion_timestamp
                      ? (() => {
                          const start = parseISO(appointment.start_time);
                          const end = parseISO(appointment.completion_timestamp);
                          return isValid(start) && isValid(end) ? formatDuration(differenceInSeconds(end, start)) : "N/A";
                        })()
                      : "N/A";

                    // Calculate Waiting Time
                    const waitingTime = appointment.created_at && (appointment.start_time || appointment.completion_timestamp)
                      ? (() => {
                          const created = parseISO(appointment.created_at);
                          const referenceTime = isRealizada && appointment.start_time ? parseISO(appointment.start_time) : (isCancelada && appointment.completion_timestamp ? parseISO(appointment.completion_timestamp) : null);
                          return isValid(created) && isValid(referenceTime!) ? formatDuration(differenceInSeconds(referenceTime!, created)) : "N/A";
                        })()
                      : "N/A";

                    return (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium flex items-center">
                          <IconComponent className="h-4 w-4 mr-2 text-muted-foreground" />
                          {appointment.pet_name}
                        </TableCell>
                        <TableCell>{appointment.client_name}</TableCell>
                        <TableCell>{appointment.service}</TableCell>
                        <TableCell>{appointment.veterinarian || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={cn("text-white", getStatusBadgeVariant(appointment.status))}>
                            {appointment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {appointment.completion_timestamp && isValid(parseISO(appointment.completion_timestamp))
                            ? format(parseISO(appointment.completion_timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })
                            : "N/A"}
                        </TableCell>
                        <TableCell>{duration}</TableCell>
                        <TableCell>{waitingTime}</TableCell>
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
                        </TableCell> {/* NOVO: Exibe a contagem de prescrições */}
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenMedicalRecordPdfPreviewDialog(appointment);
                              }}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenRecipePdfPreviewDialog(appointment);
                                }}
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
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      Nenhuma consulta encontrada no histórico.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={historyAppointments.length === 0 || isClearingHistory}>
                  {isClearingHistory ? "Limpando..." : "Limpar Histórico"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitleComponent>Tem certeza que deseja limpar o histórico?</AlertDialogTitleComponent>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todas as consultas com status "Realizada" ou "Cancelada" serão permanentemente excluídas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooterComponent>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onClearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Limpar Histórico
                  </AlertDialogAction>
                </AlertDialogFooterComponent>
              </AlertDialogContent>
            </AlertDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        filename={recipePdfFilename}
        onConfirmDownload={handleConfirmRecipePdfDownload}
      />
    </>
  );
};

export default AppointmentHistoryDialog;