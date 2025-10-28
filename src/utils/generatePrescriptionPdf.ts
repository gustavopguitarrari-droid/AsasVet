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
  return new Promise<Blob>(async (resolve, reject) => { // <-- Tornando o callback assíncrono aqui
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const margin = 15;
      let yPos = margin;
      const lineHeight = 5;
      const sectionSpacing = 8;
      const maxWidth = 210 - 2 * margin;

      // Colors and fonts
      const primaryColor = '#3b82f6';
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
        doc.text('RECEITA MÉDICA VETERINÁRIA', 210 / 2, clinicNameY + lineHeight * 1.5, { align: 'center' });

        // Issue Date (below main title)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(lightTextColor);
        doc.text(`Data de Emissão: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, margin, yPos + lineHeight * 0.5);
        yPos += lineHeight * 2;
      };

      await addMainHeader(); // <-- Agora esta linha é válida

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
      doc.setTextColor(primaryColor);
      doc.text('PRESCRIÇÕES', margin, yPos);
      yPos += lineHeight;

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
          yPos += lineHeight;
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
    } catch (error) {
      console.error("Error in PDF generation:", error);
      reject(new Error("Erro ao gerar o PDF"));
    }
  });
};