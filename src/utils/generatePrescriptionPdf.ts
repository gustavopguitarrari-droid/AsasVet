import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
  petName: string;
  ownerName: string;
  prescriptions: MedicalRecordFormValues['prescriptions'];
  logoUrl?: string | null;
  clinicDetails: ClinicDetails;
}

export const generatePrescriptionPdf = async ({
  petName,
  ownerName,
  prescriptions,
  logoUrl,
  clinicDetails,
}: PrescriptionPdfData): Promise<Blob> => {
  return new Promise<Blob>((resolve, reject) => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const margin = 15;
      let yPos = margin;
      const lineHeight = 5;
      const sectionSpacing = 8;
      const maxWidth = 210 - 2 * margin;

      // Colors and fonts
      const primaryColor = '#3b82f6'; // Tailwind blue-500
      const secondaryColor = '#e0e7ff'; // Tailwind indigo-100
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

      await addMainHeader();

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
      doc.text(`Nome do Animal: ${petName}`, margin, yPos);
      yPos += lineHeight;
      doc.text(`Nome do Tutor: ${ownerName}`, margin, yPos);
      yPos += sectionSpacing;
      doc.setDrawColor(lightTextColor);
      doc.line(margin, yPos, 210 - margin, yPos);
      yPos += sectionSpacing;

      // --- Prescriptions Section ---
      if (prescriptions && prescriptions.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.text('PRESCRIÇÕES', margin, yPos);
        yPos += lineHeight;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textColor);
        doc.setFontSize(10);

        prescriptions.forEach((p, index) => {
          addPageIfNeeded(lineHeight * 5); // Estimate space for each prescription
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. Medicamento: `, margin + 5, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(p.medication, margin + 5 + doc.getTextWidth(`${index + 1}. Medicamento: `), yPos);
          yPos += lineHeight;

          doc.text(`   Dosagem: ${p.dosage}`, margin + 10, yPos);
          yPos += lineHeight;

          doc.text(`   Frequência: ${p.frequency}`, margin + 10, yPos);
          yPos += lineHeight;

          if (p.instructions && p.instructions.trim() !== '') {
            doc.text(`   Instruções: `, margin + 10, yPos);
            const instructionsText = doc.splitTextToSize(p.instructions, maxWidth - 20);
            doc.text(instructionsText, margin + 10 + doc.getTextWidth(`   Instruções: `), yPos);
            yPos += instructionsText.length * lineHeight;
          }
          yPos += lineHeight; // Extra space between prescriptions
        });
      } else {
        addPageIfNeeded(lineHeight * 2);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(lightTextColor);
        doc.text('Nenhuma prescrição adicionada.', margin, yPos);
        yPos += lineHeight * 2;
      }

      // --- Veterinarian Signature ---
      addPageIfNeeded(lineHeight * 5);
      yPos = Math.max(yPos, 297 - margin - lineHeight * 5); // Ensure signature is at the bottom
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

      const blob = doc.output('blob');
      resolve(blob);
    } catch (error) {
      console.error("Error in PDF generation:", error);
      reject(new Error("Erro ao gerar o PDF da receita"));
    }
  });
};