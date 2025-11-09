import jsPDF from 'jspdf';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { InternedPatient, PatientAction } from '@/pages/Internacao';

interface ClinicDetails {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  veterinarianCrmv: string;
  veterinarianName: string;
}

interface DischargeSummaryPdfData {
  patient: InternedPatient;
  medicationActions: PatientAction[];
  logoUrl?: string | null;
  clinicDetails: ClinicDetails;
}

export const generateDischargeSummaryPdf = ({ patient, medicationActions, logoUrl, clinicDetails }: DischargeSummaryPdfData): Promise<Blob> => {
  return new Promise<Blob>(async (resolve, reject) => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const margin = 15;
      let yPos = margin;
      const lineHeight = 6;
      const sectionSpacing = 10;
      const maxWidth = 210 - 2 * margin;
      const labelValueOffset = 2;

      const darkGreenColor = '#1a472a';
      const textColor = '#333333';
      const lightTextColor = '#666666';
      doc.setFont('helvetica');
      doc.setTextColor(textColor);

      const addPageIfNeeded = (requiredSpace = lineHeight * 4) => {
        if (yPos + requiredSpace > 297 - margin) {
          doc.addPage();
          yPos = margin;
        }
      };

      // --- Main Header ---
      const addMainHeader = async () => {
        let currentHeaderY = yPos;

        if (logoUrl) {
          try {
            const img = new Image();
            img.src = logoUrl;
            await new Promise<void>((resolveImg, rejectImg) => {
              img.onload = () => resolveImg();
              img.onerror = (e) => rejectImg(e);
            });
            const imgWidth = 25;
            const imgHeight = (img.height * imgWidth) / img.width;
            doc.addImage(img, 'PNG', margin, currentHeaderY, imgWidth, imgHeight);
            currentHeaderY = Math.max(currentHeaderY, currentHeaderY + imgHeight + lineHeight);
          } catch (e) {
            console.error("Error loading or adding logo to PDF:", e);
            currentHeaderY += lineHeight * 2;
          }
        } else {
          currentHeaderY += lineHeight;
        }

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkGreenColor);
        doc.text('RESUMO DE ALTA - MEDICAÇÕES', 210 / 2, currentHeaderY, { align: 'center' });
        currentHeaderY += lineHeight * 1.5;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkGreenColor);
        doc.text(clinicDetails.companyName || 'Nome da Clínica', 210 / 2, currentHeaderY, { align: 'center' });
        currentHeaderY += lineHeight * 1.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(lightTextColor);
        doc.text(`Data de Emissão: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, margin, currentHeaderY);
        currentHeaderY += lineHeight * 2;

        yPos = currentHeaderY;
      };

      await addMainHeader();

      doc.setDrawColor(darkGreenColor);
      doc.line(margin, yPos, 210 - margin, yPos);
      yPos += sectionSpacing;

      // --- Patient Details ---
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGreenColor);
      doc.text('DADOS DO PACIENTE', margin, yPos);
      yPos += lineHeight;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(textColor);

      const patientDetails = [
        { label: 'Nome do Animal', value: patient.pet_name },
        { label: 'Espécie', value: patient.species },
        { label: 'Nome do Tutor', value: patient.owner_name },
        { label: 'Veterinário Responsável', value: patient.veterinarian },
        { label: 'Data de Admissão', value: format(parseISO(patient.admission_date), 'dd/MM/yyyy', { locale: ptBR }) },
        { label: 'Data de Alta', value: patient.expected_discharge_date ? format(parseISO(patient.expected_discharge_date), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A' },
        { label: 'Motivo da Internação', value: patient.reason },
        { label: 'Baia', value: patient.bay_name },
        { label: 'Risco', value: patient.risk },
        { label: 'Status Final', value: patient.status },
      ];

      let currentX = margin;
      const colWidth = maxWidth / 2;
      const detailLineHeight = lineHeight * 1.2;

      patientDetails.forEach((detail, index) => {
        addPageIfNeeded(detailLineHeight);
        doc.setFont('helvetica', 'bold');
        doc.text(`${detail.label}:`, currentX, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(detail.value, currentX + doc.getTextWidth(`${detail.label}:`) + labelValueOffset, yPos);

        if (index % 2 === 0 && index < patientDetails.length - 1) {
          currentX += colWidth;
        } else {
            currentX = margin;
            yPos += detailLineHeight;
        }
      });

      if (currentX !== margin) {
        yPos += detailLineHeight;
      }

      yPos += sectionSpacing;
      doc.setDrawColor(lightTextColor);
      doc.line(margin, yPos, 210 - margin, yPos);
      yPos += sectionSpacing;

      // --- Medication History ---
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGreenColor);
      doc.text('HISTÓRICO DE MEDICAÇÕES', margin, yPos);
      yPos += sectionSpacing;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor);
      doc.setFontSize(10);

      if (medicationActions && medicationActions.length > 0) {
        // Sort actions chronologically
        const sortedActions = [...medicationActions].sort((a, b) => {
          const dateA = parseISO(`${a.date}T${a.hour}:00`);
          const dateB = parseISO(`${b.date}T${b.hour}:00`);
          return dateA.getTime() - dateB.getTime();
        });

        sortedActions.forEach((action, index) => {
          addPageIfNeeded(lineHeight * 3);
          const actionDateTime = format(parseISO(`${action.date}T${action.hour}:00`), 'dd/MM/yyyy HH:mm', { locale: ptBR });
          
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. Data/Hora:`, margin + 5, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(actionDateTime, margin + 5 + doc.getTextWidth(`${index + 1}. Data/Hora:`) + labelValueOffset, yPos);
          yPos += lineHeight;

          doc.text(`  Descrição: `, margin + 10, yPos);
          const descriptionText = doc.splitTextToSize(action.description, maxWidth - 20);
          doc.text(descriptionText, margin + 10 + doc.getTextWidth(`  Descrição: `) + labelValueOffset, yPos);
          yPos += descriptionText.length * lineHeight;

          if (action.quantity && action.route) {
            doc.text(`  Dosagem: ${action.quantity} (${action.route})`, margin + 10, yPos);
            yPos += lineHeight;
          }
          if (action.frequency) {
            doc.text(`  Frequência: ${action.frequency}`, margin + 10, yPos);
            yPos += lineHeight;
          }
          yPos += lineHeight * 1.5;
        });
      } else {
        addPageIfNeeded(lineHeight * 2);
        doc.text('Nenhuma medicação registrada para este paciente.', margin, yPos);
        yPos += lineHeight;
      }
      yPos += sectionSpacing;

      // --- Veterinarian Signature ---
      addPageIfNeeded(lineHeight * 5);
      yPos = Math.max(yPos, 297 - margin - lineHeight * 5);
      doc.setDrawColor(lightTextColor);
      doc.line(margin + maxWidth / 4, yPos, margin + maxWidth * 3 / 4, yPos);
      yPos += lineHeight;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor);
      doc.text(clinicDetails.veterinarianName || 'Nome do Veterinário', 210 / 2, yPos, { align: 'center' });
      yPos += lineHeight;
      doc.text(`CRMV: ${clinicDetails.veterinarianCrmv || 'N/A'}`, 210 / 2, yPos, { align: 'center' });
      yPos += sectionSpacing;

      // --- Footer ---
      const addFooter = () => {
        const pageCount = (doc.internal as any).getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(lightTextColor);
          doc.text(`Página ${i} de ${pageCount}`, margin, 297 - margin + 5);
          
          const footerLines = [];
          if (clinicDetails.address && clinicDetails.address.trim() !== '') {
            footerLines.push(clinicDetails.address);
          }
          if (clinicDetails.phone && clinicDetails.phone.trim() !== '') {
            footerLines.push(`Tel: ${clinicDetails.phone}`);
          }
          if (clinicDetails.email && clinicDetails.email.trim() !== '') {
            footerLines.push(`Email: ${clinicDetails.email}`);
          }

          const footerText = footerLines.filter(Boolean).join(' | ');
          doc.text(footerText, 210 - margin, 297 - margin + 5, { align: 'right' });
        }
      };
      addFooter();

      const blob = doc.output('blob');
      resolve(blob);
    } catch (error) {
      console.error("Error in PDF generation:", error);
      reject(new Error("Erro ao gerar o PDF de resumo de alta"));
    }
  });
};