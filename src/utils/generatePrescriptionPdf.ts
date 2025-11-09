import jsPDF from 'jspdf';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/pages/Appointments';
import { MedicalRecordFormValues } from '@/components/consultation/MedicalRecordForm';

interface ClinicDetails {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  veterinarianCrmv: string;
  veterinarianName: string;
}

interface PrescriptionPdfData {
  appointment: Appointment;
  prescriptions: MedicalRecordFormValues['prescriptions'];
  logoUrl?: string | null;
  clinicDetails: ClinicDetails;
}

export const generatePrescriptionPdf = ({ appointment, prescriptions, logoUrl, clinicDetails }: PrescriptionPdfData): Promise<Blob> => {
  return new Promise<Blob>(async (resolve, reject) => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const margin = 15;
      let yPos = margin;
      const lineHeight = 6; // Aumentado de 5 para 6 para mais espaço entre as linhas
      const sectionSpacing = 10; // Aumentado de 8 para 10 para mais espaço entre as seções
      const maxWidth = 210 - 2 * margin;

      // Colors and fonts
      const darkGreenColor = '#1a472a'; // Um verde escuro para os títulos
      const textColor = '#333333';
      const lightTextColor = '#666666';
      doc.setFont('helvetica');
      doc.setTextColor(textColor);

      // Function to add a new page
      const addPageIfNeeded = (requiredSpace = lineHeight * 4) => {
        if (yPos + requiredSpace > 297 - margin) {
          doc.addPage();
          yPos = margin;
        }
      };

      // --- Main Header ---
      const addMainHeader = async () => {
        let currentHeaderY = yPos; // Start of the header block

        // Clinic Logo (top left corner)
        if (logoUrl) {
          try {
            const img = new Image();
            img.src = logoUrl;
            
            // Convert to promise for image loading
            await new Promise<void>((resolveImg, rejectImg) => {
              img.onload = () => resolveImg();
              img.onerror = (e) => rejectImg(e);
            });
            
            const imgWidth = 25;
            const imgHeight = (img.height * imgWidth) / img.width;
            doc.addImage(img, 'PNG', margin, currentHeaderY, imgWidth, imgHeight);
            currentHeaderY = Math.max(currentHeaderY, currentHeaderY + imgHeight + lineHeight); // Ensure enough space below logo
          } catch (e) {
            console.error("Error loading or adding logo to PDF:", e);
            currentHeaderY += lineHeight * 2; // Fallback space
          }
        } else {
          currentHeaderY += lineHeight; // Just some initial space if no logo
        }

        // Document Title (always centered)
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkGreenColor);
        doc.text('RECEITA MÉDICA VETERINÁRIA', 210 / 2, currentHeaderY, { align: 'center' });
        currentHeaderY += lineHeight * 1.5; // Space after main title

        // Clinic Name (now centered below the main title)
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkGreenColor);
        doc.text(clinicDetails.companyName || 'Nome da Clínica', 210 / 2, currentHeaderY, { align: 'center' });
        currentHeaderY += lineHeight * 1.5; // Space after company name

        // Issue Date (left-aligned)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(lightTextColor);
        doc.text(`Data de Emissão: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, margin, currentHeaderY);
        currentHeaderY += lineHeight * 2; // Space before separator

        yPos = currentHeaderY; // Update global yPos
      };

      await addMainHeader();

      // Separator line after main header
      doc.setDrawColor(darkGreenColor); // Usar verde escuro para a linha
      doc.line(margin, yPos, 210 - margin, yPos);
      yPos += sectionSpacing;

      // --- Patient and Owner Details ---
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGreenColor); // Usar verde escuro para o título da seção
      doc.text('DADOS DO PACIENTE E TUTOR', margin, yPos);
      yPos += lineHeight;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(textColor);

      const patientDetails = [
        { label: 'Nome do Animal', value: appointment.pet_name },
        { label: 'Espécie', value: appointment.species },
        { label: 'Nome do Tutor', value: appointment.client_name },
        { label: 'Veterinário', value: appointment.veterinarian },
        { label: 'Data da Consulta', value: format(parseISO(appointment.date), 'dd/MM/yyyy', { locale: ptBR }) },
      ];

      let currentX = margin;
      const colWidth = maxWidth / 2;
      const detailLineHeight = lineHeight * 1.2;

      patientDetails.forEach((detail, index) => {
        addPageIfNeeded(detailLineHeight);
        doc.setFont('helvetica', 'bold');
        doc.text(`${detail.label}: `, currentX, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(detail.value, currentX + doc.getTextWidth(`${detail.label}: `), yPos);

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

      // --- Prescriptions Section ---
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGreenColor); // Usar verde escuro para o título da seção
      doc.text('PRESCRIÇÕES', margin, yPos);
      yPos += sectionSpacing; // Aumentado o espaçamento após o título da seção

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor);
      doc.setFontSize(10);

      if (prescriptions && prescriptions.length > 0) {
        prescriptions.forEach((p, index) => {
          addPageIfNeeded(lineHeight * 5);
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. Medicamento: `, margin + 5, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(p.medication, margin + 5 + doc.getTextWidth(`${index + 1}. Medicamento: `), yPos);
          yPos += lineHeight;

          doc.text(`  Dosagem: ${p.dosage}`, margin + 10, yPos);
          yPos += lineHeight;

          doc.text(`  Frequência: ${p.frequency}`, margin + 10, yPos);
          yPos += lineHeight;

          if (p.instructions && p.instructions.trim() !== '') {
            doc.text(`  Instruções: `, margin + 10, yPos);
            const instructionsText = doc.splitTextToSize(p.instructions, maxWidth - 20);
            doc.text(instructionsText, margin + 10 + doc.getTextWidth(`  Instruções: `), yPos);
            yPos += instructionsText.length * lineHeight;
          }
          yPos += lineHeight * 1.5; // Espaço extra após cada item de prescrição
        });
      } else {
        addPageIfNeeded(lineHeight * 2);
        doc.text('Nenhuma prescrição adicionada.', margin, yPos);
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

      // Return the PDF as a Blob
      const blob = doc.output('blob');
      resolve(blob);
    } catch (error) {
      console.error("Error in PDF generation:", error);
      reject(new Error("Erro ao gerar o PDF"));
    }
  });
};