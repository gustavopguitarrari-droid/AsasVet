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

interface MedicalRecordPdfData {
  appointment: Appointment;
  medicalRecord: MedicalRecordFormValues;
  logoUrl?: string | null;
  filename?: string;
  clinicDetails: ClinicDetails;
}

export const generateMedicalRecordPdf = async ({ appointment, medicalRecord, logoUrl, filename, clinicDetails }: MedicalRecordPdfData): Promise<Blob> => {
  return new Promise<Blob>((resolve, reject) => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const margin = 15;
      let yPos = margin;
      const lineHeight = 6; // Aumentado de 5 para 6 para mais espaço entre as linhas
      const sectionSpacing = 10; // Aumentado de 8 para 10 para mais espaço entre as seções
      const maxWidth = 210 - 2 * margin;
      const labelValueOffset = 2; // NOVO: Espaçamento entre o rótulo e o valor

      // Colors and fonts (ajustado para o estilo da receita)
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
        doc.text('PRONTUÁRIO MÉDICO VETERINÁRIO', 210 / 2, currentHeaderY, { align: 'center' });
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

      // Execute header creation
      await addMainHeader(); // Usar await aqui

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
        { label: 'Raça', value: 'N/A' }, // Raça não está no appointment, manter N/A ou buscar se disponível
        { label: 'Nome do Tutor', value: appointment.client_name },
        { label: 'Serviço', value: appointment.service },
        { label: 'Veterinário', value: appointment.veterinarian },
        { label: 'Data da Consulta', value: format(parseISO(appointment.date), 'dd/MM/yyyy', { locale: ptBR }) },
        { label: 'Hora', value: appointment.time },
        { label: 'Status', value: appointment.status },
      ];

      let currentX = margin;
      const colWidth = maxWidth / 2;
      const detailLineHeight = lineHeight * 1.2;

      patientDetails.forEach((detail, index) => {
        addPageIfNeeded(detailLineHeight);
        doc.setFont('helvetica', 'bold');
        doc.text(`${detail.label}:`, currentX, yPos); // Removido o espaço extra aqui
        doc.setFont('helvetica', 'normal');
        doc.text(detail.value, currentX + doc.getTextWidth(`${detail.label}:`) + labelValueOffset, yPos); // Adicionado labelValueOffset

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

      // --- Medical Record Sections ---
      const addSection = (title: string, content?: string | null) => {
        if (!content) {
          return;
        }

        addPageIfNeeded(lineHeight * 3);
        // Removido o preenchimento de cor de fundo para o título da seção
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkGreenColor); // Usar verde escuro para o título da seção
        doc.text(title, margin, yPos); // Alinhado à esquerda
        yPos += lineHeight; // Espaço após o título da seção

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textColor);
        doc.setFontSize(10);

        const splitText = doc.splitTextToSize(content, maxWidth);
        doc.text(splitText, margin, yPos);
        yPos += splitText.length * lineHeight;
        
        yPos += sectionSpacing;
      };

      addSection('ANAMNESE', medicalRecord.anamnesis);
      addSection('EXAME FÍSICO', medicalRecord.physicalExam);
      addSection('DIAGNÓSTICO', medicalRecord.diagnosis);
      addSection('TRATAMENTO', medicalRecord.treatment);
      // REMOVIDO: A seção de prescrições não será mais incluída no prontuário médico.

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