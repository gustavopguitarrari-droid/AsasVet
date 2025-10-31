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
      const lineHeight = 5;
      const sectionSpacing = 8;
      const maxWidth = 210 - 2 * margin;

      // Colors and fonts
      const primaryColor = '#3b82f6';
      const secondaryColor = '#e0e7ff';
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
        const headerStartY = yPos;

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
            doc.addImage(img, 'PNG', margin, yPos, imgWidth, imgHeight);
            yPos += imgHeight > lineHeight * 2 ? imgHeight : lineHeight * 2;
          } catch (e) {
            console.error("Error loading or adding logo to PDF:", e);
            // Continue without logo if it fails
            yPos += lineHeight * 2;
          }
        } else {
          yPos += lineHeight * 2;
        }

        // Clinic Name (next to logo or at top if no logo)
        const clinicNameX = logoUrl ? margin + 30 : margin;
        const clinicNameY = headerStartY + lineHeight;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.text(clinicDetails.companyName || 'Nome da Clínica', clinicNameX, clinicNameY);

        // Document Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.text('PRONTUÁRIO MÉDICO VETERINÁRIO', 210 / 2, clinicNameY + lineHeight * 1.5, { align: 'center' });

        // Issue Date (below main title)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(lightTextColor);
        doc.text(`Data de Emissão: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, margin, yPos + lineHeight * 0.5);
        yPos += lineHeight * 2;
      };

      // Execute header creation
      addMainHeader().then(() => {
        // Separator line after main header
        doc.setDrawColor(primaryColor);
        doc.line(margin, yPos, 210 - margin, yPos);
        yPos += sectionSpacing;

        // --- Patient and Owner Details ---
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.text('DADOS DO PACIENTE E TUTOR', margin, yPos);
        yPos += lineHeight;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(textColor);

        const patientDetails = [
          { label: 'Nome do Animal', value: appointment.pet_name },
          { label: 'Espécie', value: appointment.species },
          { label: 'Raça', value: 'N/A' },
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

        // --- Medical Record Sections ---
        const addSection = (title: string, content?: string | null) => { // Removed isPrescription parameter
          if (!content) {
            return;
          }

          addPageIfNeeded(lineHeight * 3);
          doc.setFillColor(secondaryColor);
          doc.rect(margin, yPos, maxWidth, lineHeight * 1.5, 'F');
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(primaryColor);
          doc.text(title, margin + 2, yPos + lineHeight);
          yPos += lineHeight * 2;

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
        // addSection('PRESCRIÇÕES', null, true);

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
            
            const footerText = [
              clinicDetails.address,
              `Tel: ${clinicDetails.phone} | Email: ${clinicDetails.email}`
            ].filter(Boolean).join(' | ');
            doc.text(footerText, 210 - margin, 297 - margin + 5, { align: 'right' });
          }
        };
        addFooter();

        // Return the PDF as a Blob
        const blob = doc.output('blob');
        resolve(blob);
      }).catch((error) => {
        console.error("Error in PDF generation:", error);
        reject(new Error("Erro ao gerar o PDF"));
      });
    } catch (error) {
      console.error("Error in PDF generation:", error);
      reject(new Error("Erro ao gerar o PDF"));
    }
  });
};