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
import { generatePrescriptionPdf } from '@/utils/generatePrescriptionPdf';
import { uploadRecipePdfToSupabase, deleteRecipePdfFromSupabase } from '@/utils/supabaseStorage';

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
  const userId = appUser?.id;

  // States for PDF preview dialog
  const [isPdfPreviewDialogOpen, setIsPdfPreviewDialogOpen] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFilename, setPdfFilename] = useState("");
  const [pdfAppointment, setPdfAppointment] = useState<Appointment | null>(null);

  // Estados para o diálogo de pré-visualização de PDF de receita
  const [isRecipePdfPreviewDialogOpen, setIsRecipePdfPreviewDialogOpen] = useState(false);
  const [recipePdfBlob, setRecipePdfBlob] = useState<Blob | null>(null);
  const [recipePdfUrl, setRecipePdfUrl] = useState<string | null>(null);
  const [recipePdfFilename, setRecipePdfFilename] = useState("");

  // Mutation to fetch the medical record and generate the PDF
  const fetchAndGeneratePdfMutation = useMutation({
    mutationFn: async ({ appointment }: { appointment: Appointment }) => {
      if (!userId) throw new Error("User not authenticated.");
      const currentUserId: string = userId;

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
        console.error("AppointmentHistoryDialog: Error fetching medical record for PDF generation:", fetchError); // Add log
        throw fetchError;
      }

      if (!medicalRecordData) {
        throw new Error("Prontuário médico não encontrado.");
      }
      console.log("AppointmentHistoryDialog: Raw medical record data for PDF generation:", medicalRecordData); // Add log

      const medicalRecordForPdf: MedicalRecordFormValues = {
        anamnesis: medicalRecordData.anamnesis || undefined,
        physicalExam: medicalRecordData.physical_exam || undefined,
        diagnosis: medicalRecordData.diagnosis || undefined,
        treatment: medicalRecordData.treatment || undefined,
        prescriptions: medicalRecordData.prescriptions || [],
      };

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
      if (!userId) return;
      const currentUserId: string = userId;
      setPdfBlob(blob);
      setPdfFilename(`Prontuario_${appointment.pet_name}_${format(parseISO(appointment.date), 'yyyyMMdd')}.pdf`);
      setPdfAppointment(appointment);
      setIsPdfPreviewDialogOpen(true);
    },
    onError: (err: any) => {
      console.error("AppointmentHistoryDialog: fetchAndGeneratePdfMutation - Erro ao gerar PDF do histórico:", err);
      showError(`Erro ao gerar PDF: ${err.message || "Erro desconhecido"}`);
    },
  });

  // NOVO: Mutação para buscar o prontuário médico e gerar o PDF da receita
  const fetchAndGenerateRecipePdfMutation = useMutation({
    mutationFn: async ({ appointment }: { appointment: Appointment }) => {
      if (!userId) throw new Error("User not authenticated.");
      const currentUserId: string = userId;

      console.log("AppointmentHistoryDialog: fetchAndGenerateRecipePdfMutation - Checking for existing recipe_pdf_url:", appointment.recipe_pdf_url);
      if (appointment.recipe_pdf_url) {
        console.log("AppointmentHistoryDialog: fetchAndGenerateRecipePdfMutation - Existing recipe_pdf_url found, using it directly.");
        return { pdfUrl: appointment.recipe_pdf_url, appointment };
      }

      console.log("AppointmentHistoryDialog: fetchAndGenerateRecipePdfMutation - No existing recipe_pdf_url, fetching medical record for prescriptions.");
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
        console.error("AppointmentHistoryDialog: Error fetching medical record for Recipe PDF generation:", fetchError); // Add log
        throw fetchError;
      }

      if (!medicalRecordData) {
        throw new Error("Prontuário médico não encontrado.");
      }
      console.log("AppointmentHistoryDialog: Raw medical record data for Recipe PDF generation:", medicalRecordData); // Add log
      console.log("AppointmentHistoryDialog: Fetched medicalRecordData.prescriptions:", medicalRecordData.prescriptions);
      if (!medicalRecordData.prescriptions || medicalRecordData.prescriptions.length === 0) {
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

      const newPdfUrl = await uploadRecipePdfToSupabase(pdfBlob, currentUserId, appointment.id);
      console.log("AppointmentHistoryDialog: fetchAndGenerateRecipePdfMutation - Uploaded new recipe PDF to URL:", newPdfUrl);
      if (!newPdfUrl) {
        throw new Error("Falha ao fazer upload do PDF da receita.");
      }

      await supabase
        .from('medical_records')
        .update({ recipe_pdf_url: newPdfUrl })
        .eq('id', medicalRecordData.id)
        .eq('user_id', currentUserId);
      console.log("AppointmentHistoryDialog: fetchAndGenerateRecipePdfMutation - Medical record updated with new recipe_pdf_url.");

      return { pdfBlob, pdfUrl: newPdfUrl, appointment };
    },
    onSuccess: ({ pdfBlob, pdfUrl, appointment }) => {
      if (!userId) return;
      const currentUserId: string = userId;
      queryClient.invalidateQueries({ queryKey: ['appointments', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['historyAppointments', currentUserId] });
      setRecipePdfBlob(pdfBlob || null);
      setRecipePdfUrl(pdfUrl || null);
      setRecipePdfFilename(`Receita_${appointment.pet_name}_${format(parseISO(appointment.date), 'yyyyMMdd')}.pdf`);
      setIsRecipePdfPreviewDialogOpen(true);
    },
    onError: (err: any) => {
      console.error("AppointmentHistoryDialog: fetchAndGenerateRecipePdfMutation - Erro ao gerar PDF da receita do histórico:", err);
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

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const dateA = parseISO(a.created_at);
    const dateB = parseISO(b.created_at);
    return dateB.getTime() - dateA.getTime();
  });

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
                  <TableHead>Receitas</TableHead>
                  <TableHead className="text-right">Prontuário / Receita</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHistory.length > 0 ? (
                  sortedHistory.map((appointment) => {
                    const IconComponent = speciesIconMap[appointment.species] || MoreHorizontal;
                    const isRealizada = appointment.status === 'Realizada';
                    const isCancelada = appointment.status === 'Cancelada';

                    const duration = isRealizada && appointment.start_time && appointment.completion_timestamp
                      ? (() => {
                          const start = parseISO(appointment.start_time);
                          const end = parseISO(appointment.completion_timestamp);
                          return isValid(start) && isValid(end) ? formatDuration(differenceInSeconds(end, start)) : "N/A";
                        })()
                      : "N/A";

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
                        </TableCell>
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

export default AppointmentHistoryDialog;