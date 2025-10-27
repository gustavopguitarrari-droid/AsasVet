import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/pages/Appointments';
import { MedicalRecordFormValues } from '@/components/consultation/MedicalRecordForm';

interface MedicalRecordPdfData {
  appointment: Appointment;
  medicalRecord: MedicalRecordFormValues;
}

export const generateMedicalRecordPdf = async ({ appointment, medicalRecord }: MedicalRecordPdfData) => {
  const doc = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for millimeters, 'a4' for A4 size
  const margin = 10;
  let yPos = margin;
  const lineHeight = 7;
  const maxWidth = 210 - 2 * margin; // A4 width - 2 * margin

  // Set font for pt-BR characters
  doc.setFont('helvetica'); // Default font, usually supports basic Latin characters. For full pt-BR support, a custom font might be needed.
  doc.setFontSize(10);

  // Header
  doc.setFontSize(16);
  doc.text('Prontuário Médico - AsasVet', margin, yPos);
  yPos += lineHeight * 2;

  doc.setFontSize(12);
  doc.text(`Data de Emissão: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, margin, yPos);
  yPos += lineHeight;
  doc.line(margin, yPos, 210 - margin, yPos); // Horizontal line
  yPos += lineHeight;

  // Appointment Details
  doc.setFontSize(14);
  doc.text('Detalhes da Consulta', margin, yPos);
  yPos += lineHeight;

  doc.setFontSize(10);
  doc.text(`Tutor: ${appointment.client_name}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Animal: ${appointment.pet_name} (${appointment.species})`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Serviço: ${appointment.service}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Veterinário: ${appointment.veterinarian}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Data da Consulta: ${format(parseISO(appointment.date), 'dd/MM/yyyy', { locale: ptBR })} às ${appointment.time}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Status: ${appointment.status}`, margin, yPos);
  yPos += lineHeight;
  if (appointment.start_time && isValid(parseISO(appointment.start_time))) {
    doc.text(`Início: ${format(parseISO(appointment.start_time), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, margin, yPos);
    yPos += lineHeight;
  }
  if (appointment.completion_timestamp && isValid(parseISO(appointment.completion_timestamp))) {
    doc.text(`Finalização: ${format(parseISO(appointment.completion_timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, margin, yPos);
    yPos += lineHeight;
  }
  doc.line(margin, yPos, 210 - margin, yPos); // Horizontal line
  yPos += lineHeight;

  // Medical Record Sections
  const addSection = (title: string, content?: string | null) => {
    if (content) {
      if (yPos + lineHeight * 2 > 297 - margin) { // Check for page break
        doc.addPage();
        yPos = margin;
      }
      doc.setFontSize(14);
      doc.text(title, margin, yPos);
      yPos += lineHeight;
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(content, maxWidth);
      doc.text(splitText, margin, yPos);
      yPos += splitText.length * lineHeight;
      yPos += lineHeight; // Extra space after section
    }
  };

  addSection('Anamnese', medicalRecord.anamnesis);
  addSection('Exame Físico', medicalRecord.physicalExam);
  addSection('Diagnóstico', medicalRecord.diagnosis);
  addSection('Tratamento', medicalRecord.treatment);

  // Prescriptions
  if (medicalRecord.prescriptions && medicalRecord.prescriptions.length > 0) {
    if (yPos + lineHeight * 2 > 297 - margin) { // Check for page break
      doc.addPage();
      yPos = margin;
    }
    doc.setFontSize(14);
    doc.text('Prescrições', margin, yPos);
    yPos += lineHeight;
    doc.setFontSize(10);

    medicalRecord.prescriptions.forEach((p, index) => {
      const prescriptionText = `  ${index + 1}. Medicamento: ${p.medication}\n     Dosagem: ${p.dosage}\n     Frequência: ${p.frequency}${p.instructions ? `\n     Instruções: ${p.instructions}` : ''}`;
      const splitText = doc.splitTextToSize(prescriptionText, maxWidth - 5); // Indent for list
      
      if (yPos + splitText.length * lineHeight > 297 - margin) { // Check for page break within prescription
        doc.addPage();
        yPos = margin;
        doc.setFontSize(14);
        doc.text('Prescrições (continuação)', margin, yPos);
        yPos += lineHeight;
        doc.setFontSize(10);
      }
      doc.text(splitText, margin + 5, yPos); // Indent
      yPos += splitText.length * lineHeight;
      yPos += lineHeight / 2; // Small space between prescriptions
    });
    yPos += lineHeight / 2; // Extra space after prescriptions section
  }

  // Save the PDF
  doc.save(`Prontuario_${appointment.pet_name}_${format(parseISO(appointment.date), 'yyyyMMdd')}.pdf`);
};