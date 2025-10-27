"use client";

import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileDown, CalendarCheck, Clock, User, PawPrint, Stethoscope, Home, MapPin, IdCard, Mail, Phone, Calendar, Palette, Heart, Info, FlaskConical } from 'lucide-react';
import { Appointment } from "@/pages/Appointments";
import { Client, Pet } from "@/types/cadastro";
import { format, parseISO, isValid, differenceInSeconds } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { showError, showSuccess } from '@/utils/toast';

interface ConsultationPdfGeneratorProps {
  appointment: Appointment;
  client: Client;
  pet: Pet;
  onClose: () => void;
}

const speciesIconMap: { [key: string]: React.ElementType } = {
  Cachorro: PawPrint, // Usando PawPrint como um ícone genérico para animais no PDF
  Gato: PawPrint,
  Pássaro: PawPrint,
  Roedor: PawPrint,
  Peixe: PawPrint,
  Outros: PawPrint,
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

const ConsultationPdfGenerator: React.FC<ConsultationPdfGeneratorProps> = ({ appointment, client, pet, onClose }) => {
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const generatePdf = async () => {
    if (!pdfContentRef.current) {
      showError("Conteúdo para PDF não encontrado.");
      return;
    }

    showSuccess("Gerando PDF, por favor aguarde...");

    try {
      const canvas = await html2canvas(pdfContentRef.current, {
        scale: 2, // Aumenta a escala para melhor qualidade
        useCORS: true, // Importante para imagens externas (como avatares)
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`ficha_consulta_${appointment.pet_name}_${format(parseISO(appointment.date), "yyyyMMdd")}.pdf`);
      showSuccess("PDF gerado e baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      showError("Erro ao gerar PDF. Tente novamente.");
    }
  };

  const IconComponent = speciesIconMap[appointment.species] || PawPrint;

  const duration = appointment.start_time && appointment.completion_timestamp
    ? (() => {
        const start = parseISO(appointment.start_time);
        const end = parseISO(appointment.completion_timestamp);
        if (isValid(start) && isValid(end)) {
          const durationSeconds = differenceInSeconds(end, start);
          const hours = Math.floor(durationSeconds / 3600);
          const minutes = Math.floor((durationSeconds % 3600) / 60);
          const seconds = durationSeconds % 60;
          return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
        }
        return "N/A";
      })()
    : "N/A";

  return (
    <div className="space-y-4">
      <div ref={pdfContentRef} className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-md shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary">AsasVet Clínica Veterinária</h1>
          <p className="text-lg text-muted-foreground">Ficha Completa da Consulta</p>
        </div>

        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-primary">Detalhes da Consulta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center">
            <CalendarCheck className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="font-medium">Data: <span className="font-semibold">{format(parseISO(appointment.date), "dd/MM/yyyy", { locale: ptBR })}</span></p>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="font-medium">Hora: <span className="font-semibold">{appointment.time}</span></p>
          </div>
          <div className="flex items-center">
            <Stethoscope className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="font-medium">Veterinário: <span className="font-semibold">{appointment.veterinarian || "N/A"}</span></p>
          </div>
          <div className="flex items-center">
            <FlaskConical className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="font-medium">Serviço: <span className="font-semibold">{appointment.service}</span></p>
          </div>
          <div className="flex items-center">
            <Info className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="font-medium">Status: <Badge className={cn("text-white", getStatusBadgeVariant(appointment.status))}>{appointment.status}</Badge></p>
          </div>
          {appointment.completion_timestamp && (
            <div className="flex items-center">
              <CalendarCheck className="h-5 w-5 mr-2 text-muted-foreground" />
              <p className="font-medium">Finalizado em: <span className="font-semibold">{format(parseISO(appointment.completion_timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span></p>
            </div>
          )}
          {appointment.start_time && appointment.completion_timestamp && (
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
              <p className="font-medium">Duração: <span className="font-semibold">{duration}</span></p>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-primary">Detalhes do Tutor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="font-medium">Nome: <span className="font-semibold">{client.name}</span></p>
          </div>
          <div className="flex items-center">
            <IdCard className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="font-medium">CPF: <span className="font-semibold">{client.cpf}</span></p>
          </div>
          <div className="flex items-center">
            <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="font-medium">Email: <span className="font-semibold">{client.email}</span></p>
          </div>
          <div className="flex items-center">
            <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="font-medium">Telefone: <span className="font-semibold">{client.phone}</span></p>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="font-medium">Nascimento: <span className="font-semibold">
              {client.dateOfBirth && isValid(parseISO(client.dateOfBirth)) ? format(parseISO(client.dateOfBirth), "dd/MM/yyyy", { locale: ptBR }) : "N/A"}
            </span></p>
          </div>
          <div className="flex items-start col-span-full">
            <Home className="h-5 w-5 mr-2 text-muted-foreground mt-1" />
            <p className="font-medium">Endereço: <span className="font-semibold">
              {client.address.street}, {client.address.number} {client.address.complement ? `- ${client.address.complement}` : ''}, {client.address.neighborhood}, {client.address.city} - {client.address.state} (CEP: {client.address.cep})
            </span></p>
          </div>
          {client.observations && (
            <div className="flex items-start col-span-full">
              <Info className="h-5 w-5 mr-2 text-muted-foreground mt-1" />
              <p className="font-medium">Observações do Tutor: <span className="font-semibold">{client.observations}</span></p>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-primary">Detalhes do Animal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center">
            <IconComponent className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="font-medium">Nome: <span className="font-semibold">{pet.name}</span></p>
          </div>
          <div className="flex items-center">
            <PawPrint className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="font-medium">Espécie: <span className="font-semibold">{pet.species}</span></p>
          </div>
          <div className="flex items-center">
            <PawPrint className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="font-medium">Raça: <span className="font-semibold">{pet.breed}</span></p>
          </div>
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="font-medium">Idade: <span className="font-semibold">{pet.age}</span></p>
          </div>
          <div className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="font-medium">Sexo: <span className="font-semibold">{pet.gender}</span></p>
          </div>
          <div className="flex items-center">
            <Palette className="h-5 w-5 mr-2 text-muted-foreground" />
            <p className="font-medium">Cor: <span className="font-semibold">{pet.color}</span></p>
          </div>
          {pet.observations && (
            <div className="flex items-start col-span-full">
              <Info className="h-5 w-5 mr-2 text-muted-foreground mt-1" />
              <p className="font-medium">Observações do Animal: <span className="font-semibold">{pet.observations}</span></p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
        <Button onClick={generatePdf}>
          <FileDown className="mr-2 h-4 w-4" /> Baixar PDF
        </Button>
      </div>
    </div>
  );
};

export default ConsultationPdfGenerator;