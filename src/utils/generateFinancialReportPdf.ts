import jsPDF from 'jspdf';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { Transaction } from '@/types/cashier';

interface ClinicDetails {
  companyName: string;
  address: string;
  phone: string;
  email: string;
}

interface FinancialReportPdfData {
  transactions: Transaction[];
  summary: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  dateRange: DateRange;
  logoUrl?: string | null;
  clinicDetails: ClinicDetails;
}

export const generateFinancialReportPdf = async ({
  transactions,
  summary,
  dateRange,
  logoUrl,
  clinicDetails,
}: FinancialReportPdfData): Promise<Blob> => {
  return new Promise<Blob>(async (resolve, reject) => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const margin = 15;
      let yPos = margin;
      const lineHeight = 6;
      const sectionSpacing = 10;
      const maxWidth = 210 - 2 * margin;

      const darkGreenColor = '#1a472a';
      const textColor = '#333333';
      const lightTextColor = '#666666';
      const greenColor = '#16a34a';
      const redColor = '#dc2626';
      doc.setFont('helvetica');
      doc.setTextColor(textColor);

      const addPageIfNeeded = (requiredSpace = lineHeight * 4) => {
        if (yPos + requiredSpace > 297 - margin) {
          doc.addPage();
          yPos = margin;
          // You might want to add headers to new pages here
        }
      };

      // --- Header ---
      if (logoUrl) {
        try {
          const img = new Image();
          img.src = logoUrl;
          await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; });
          const imgWidth = 25;
          const imgHeight = (img.height * imgWidth) / img.width;
          doc.addImage(img, 'PNG', margin, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 5;
        } catch (e) {
          console.error("Error loading logo for PDF:", e);
        }
      }

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGreenColor);
      doc.text('Extrato Financeiro', 210 / 2, yPos, { align: 'center' });
      yPos += lineHeight * 2;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(lightTextColor);
      const period = `Período: ${format(dateRange.from!, 'dd/MM/yyyy', { locale: ptBR })} a ${format(dateRange.to!, 'dd/MM/yyyy', { locale: ptBR })}`;
      doc.text(period, 210 / 2, yPos, { align: 'center' });
      yPos += lineHeight * 2;

      doc.setDrawColor(darkGreenColor);
      doc.line(margin, yPos, 210 - margin, yPos);
      yPos += sectionSpacing;

      // --- Summary ---
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkGreenColor);
      doc.text('Resumo do Período', margin, yPos);
      yPos += lineHeight * 1.5;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(greenColor);
      doc.text(`Total de Entradas: R$ ${summary.revenue.toFixed(2).replace('.', ',')}`, margin, yPos);
      yPos += lineHeight;
      doc.setTextColor(redColor);
      doc.text(`Total de Saídas: R$ ${summary.expenses.toFixed(2).replace('.', ',')}`, margin, yPos);
      yPos += lineHeight;
      doc.setTextColor(summary.profit >= 0 ? greenColor : redColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`Lucro/Prejuízo Líquido: R$ ${summary.profit.toFixed(2).replace('.', ',')}`, margin, yPos);
      yPos += sectionSpacing;

      // --- Transaction Table ---
      const drawTableHeader = () => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, yPos, maxWidth, lineHeight, 'F');
        doc.text('Data', margin + 2, yPos + lineHeight - 2);
        doc.text('Descrição', margin + 25, yPos + lineHeight - 2);
        doc.text('Saída (-)', margin + 100, yPos + lineHeight - 2, { align: 'right' });
        doc.text('Entrada (+)', margin + 130, yPos + lineHeight - 2, { align: 'right' });
        doc.text('Saldo', margin + 160, yPos + lineHeight - 2, { align: 'right' });
        yPos += lineHeight;
      };

      drawTableHeader();

      let runningBalance = 0;
      const sortedTransactions = [...transactions].sort((a, b) => parseISO(a.created_at).getTime() - parseISO(b.created_at).getTime());

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      for (const tx of sortedTransactions) {
        const amount = tx.type === 'Entrada' ? tx.amount : -tx.amount;
        runningBalance += amount;

        const descriptionLines = doc.splitTextToSize(tx.description, 60);
        const rowHeight = descriptionLines.length * lineHeight;
        addPageIfNeeded(rowHeight + 2);

        doc.text(format(parseISO(tx.created_at), 'dd/MM/yy HH:mm'), margin + 2, yPos + lineHeight - 2);
        doc.text(descriptionLines, margin + 25, yPos + lineHeight - 2);

        if (tx.type === 'Saída') {
          doc.setTextColor(redColor);
          doc.text(`R$ ${tx.amount.toFixed(2).replace('.', ',')}`, margin + 100, yPos + lineHeight - 2, { align: 'right' });
        } else {
          doc.setTextColor(greenColor);
          doc.text(`R$ ${tx.amount.toFixed(2).replace('.', ',')}`, margin + 130, yPos + lineHeight - 2, { align: 'right' });
        }
        
        doc.setTextColor(runningBalance >= 0 ? textColor : redColor);
        doc.text(`R$ ${runningBalance.toFixed(2).replace('.', ',')}`, margin + 160, yPos + lineHeight - 2, { align: 'right' });
        
        doc.setTextColor(textColor);
        yPos += rowHeight;
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, yPos, 210 - margin, yPos);
        yPos += 2;
      }

      // --- Footer ---
      const addFooter = () => {
        const pageCount = (doc.internal as any).getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(lightTextColor);
          doc.text(`Página ${i} de ${pageCount}`, margin, 297 - margin + 5);
          const footerText = `${clinicDetails.companyName} | ${clinicDetails.phone} | ${clinicDetails.email}`;
          doc.text(footerText, 210 - margin, 297 - margin + 5, { align: 'right' });
        }
      };
      addFooter();

      resolve(doc.output('blob'));
    } catch (error) {
      console.error("Error in PDF generation:", error);
      reject(new Error("Erro ao gerar o PDF do relatório financeiro"));
    }
  });
};