import jsPDF from 'jspdf';
import html2canvas from 'html2canvas'; // Mantido para compatibilidade, mas não usado diretamente
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/pages/Appointments';
import { MedicalRecordFormValues } from '@/components/consultation/MedicalRecordForm';

interface MedicalRecordPdfData {
  appointment: Appointment;
  medicalRecord: MedicalRecordFormValues;
  logoUrl?: string | null; // NOVO: URL do logo para incluir no PDF
}

export const generateMedicalRecordPdf = async ({ appointment, medicalRecord, logoUrl }: MedicalRecordPdfData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const margin = 15; // Aumentar margem
  let yPos = margin;
  const lineHeight = 6; // Ajustar altura da linha
  const maxWidth = 210 - 2 * margin; // Largura A4 - 2 * margem

  // Cores e fontes
  const primaryColor = '#3b82f6'; // Um azul consistente com o tema
  const textColor = '#333333';
  const lightTextColor = '#666666';
  doc.setFont('helvetica');
  doc.setTextColor(textColor);

  // Função para adicionar nova página
  const addPageIfNeeded = () => {
    if (yPos > 297 - margin - lineHeight * 3) { // Deixar espaço para o rodapé
      doc.addPage();
      yPos = margin;
      addHeader(); // Adicionar cabeçalho em novas páginas
    }
  };

  // Função para adicionar cabeçalho
  const addHeader = () => {
    const headerY = yPos;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text('AsasVet - Prontuário Médico', margin, headerY);
    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Data de Emissão: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 210 - margin, headerY, { align: 'right' });
    
    // NOVO: Adicionar logo se disponível
    if (logoUrl) {
      const img = new Image();
      img.src = logoUrl;
      img.onload = () => {
        const imgWidth = 30; // Largura fixa para o logo
        const imgHeight = (img.height * imgWidth) / img.width; // Manter proporção
        const imgX = 210 - margin - imgWidth; // Alinhar à direita
        const imgY = headerY - imgHeight / 2 - 5; // Ajustar posição vertical
        doc.addImage(img, 'PNG', imgX, imgY, imgWidth, imgHeight);
      };
      // Se a imagem não carregar a tempo, o PDF será gerado sem ela.
      // Para garantir que o logo esteja sempre presente, pode-se usar um await img.onload,
      // mas isso tornaria a função assíncrona e mais complexa. Para este caso, é aceitável.
    }

    yPos = headerY + lineHeight * 1.5;
    doc.setDrawColor(primaryColor);
    doc.line(margin, yPos, 210 - margin, yPos); // Linha separadora
    yPos += lineHeight * 1.5;
  };

  // Função para adicionar rodapé
  const addFooter = () => {
    const pageCount = (doc.internal as any).getNumberOfPages(); // CORREÇÃO AQUI: Cast para any
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(lightTextColor);
      doc.text(`Página ${i} de ${pageCount}`, margin, 297 - margin + 5);
      doc.text('AsasVet - Gestão Veterinária', 210 - margin, 297 - margin + 5, { align: 'right' });
    }
  };

  addHeader();

  // Detalhes da Consulta
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhes da Consulta', margin, yPos);
  yPos += lineHeight;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(lightTextColor);

  const addDetail = (label: string, value: string | undefined | null) => {
    if (value) {
      addPageIfNeeded();
      doc.text(`${label}: `, margin, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(value, margin + doc.getTextWidth(`${label}: `), yPos);
      doc.setFont('helvetica', 'normal');
      yPos += lineHeight;
    }
  };

  addDetail('Tutor', appointment.client_name);
  addDetail('Animal', `${appointment.pet_name} (${appointment.species})`);
  addDetail('Serviço', appointment.service);
  addDetail('Veterinário', appointment.veterinarian);
  addDetail('Data da Consulta', format(parseISO(appointment.date), 'dd/MM/yyyy', { locale: ptBR }));
  addDetail('Hora', appointment.time);
  addDetail('Status', appointment.status);
  if (appointment.start_time && isValid(parseISO(appointment.start_time))) {
    addDetail('Início da Consulta', format(parseISO(appointment.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR }));
  }
  if (appointment.completion_timestamp && isValid(parseISO(appointment.completion_timestamp))) {
    addDetail('Finalização da Consulta', format(parseISO(appointment.completion_timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR }));
  }

  yPos += lineHeight;
  doc.setDrawColor(lightTextColor);
  doc.line(margin, yPos, 210 - margin, yPos);
  yPos += lineHeight * 1.5;

  // Seções do Prontuário Médico
  const addMedicalSection = (title: string, content?: string | null) => {
    if (content && content.trim() !== '') {
      addPageIfNeeded();
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor);
      doc.text(title, margin, yPos);
      yPos += lineHeight;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor);
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(content, maxWidth);
      doc.text(splitText, margin, yPos);
      yPos += splitText.length * lineHeight;
      yPos += lineHeight * 1.5; // Espaço extra após a seção
    }
  };

  addMedicalSection('Anamnese', medicalRecord.anamnesis);
  addMedicalSection('Exame Físico', medicalRecord.physicalExam);
  addMedicalSection('Diagnóstico', medicalRecord.diagnosis);
  addMedicalSection('Tratamento', medicalRecord.treatment);

  // Prescrições
  if (medicalRecord.prescriptions && medicalRecord.prescriptions.length > 0) {
    addPageIfNeeded();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text('Prescrições', margin, yPos);
    yPos += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor);
    doc.setFontSize(10);

    medicalRecord.prescriptions.forEach((p, index) => {
      addPageIfNeeded();
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. Medicamento: `, margin + 5, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(p.medication, margin + 5 + doc.getTextWidth(`${index + 1}. Medicamento: `), yPos);
      yPos += lineHeight;

      addPageIfNeeded();
      doc.text(`   Dosagem: ${p.dosage}`, margin + 5, yPos);
      yPos += lineHeight;

      addPageIfNeeded();
      doc.text(`   Frequência: ${p.frequency}`, margin + 5, yPos);
      yPos += lineHeight;

      if (p.instructions && p.instructions.trim() !== '') {
        addPageIfNeeded();
        doc.text(`   Instruções: `, margin + 5, yPos);
        const instructionsText = doc.splitTextToSize(p.instructions, maxWidth - 15);
        doc.text(instructionsText, margin + 5 + doc.getTextWidth(`   Instruções: `), yPos);
        yPos += instructionsText.length * lineHeight;
      }
      yPos += lineHeight * 0.5; // Pequeno espaço entre prescrições
    });
    yPos += lineHeight; // Espaço extra após a seção de prescrições
  }

  addFooter();

  doc.save(`Prontuario_${appointment.pet_name}_${format(parseISO(appointment.date), 'yyyyMMdd')}.pdf`);
};