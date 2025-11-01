"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, X, Eye } from 'lucide-react';
import { showError } from '@/utils/toast';

interface PdfPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null; // Pode ser null se pdfUrl for fornecido
  pdfUrl?: string | null; // Nova prop para URL direta
  filename: string;
  onConfirmDownload: (filename: string, downloadUrl: string) => void; // onConfirmDownload agora recebe a URL para download
}

const PdfPreviewDialog: React.FC<PdfPreviewDialogProps> = ({
  isOpen,
  onClose,
  pdfBlob,
  pdfUrl, // Usar a nova prop
  filename,
  onConfirmDownload,
}) => {
  const [internalPdfUrl, setInternalPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (pdfUrl) {
        console.log("PdfPreviewDialog: Setting internalPdfUrl from pdfUrl:", pdfUrl);
        setInternalPdfUrl(pdfUrl); // Prioriza a URL direta
      } else if (pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        console.log("PdfPreviewDialog: Setting internalPdfUrl from pdfBlob (object URL):", url);
        setInternalPdfUrl(url);
        // Clean up the object URL when the component unmounts or blob changes
        return () => URL.revokeObjectURL(url);
      } else {
        console.log("PdfPreviewDialog: No pdfUrl or pdfBlob, setting internalPdfUrl to null.");
        setInternalPdfUrl(null);
      }
    } else {
      console.log("PdfPreviewDialog: Dialog closed, setting internalPdfUrl to null.");
      setInternalPdfUrl(null); // Limpa a URL interna ao fechar o diálogo
    }
  }, [isOpen, pdfBlob, pdfUrl]); // Adicionado pdfUrl como dependência

  const handleDownload = () => {
    if (internalPdfUrl) {
      onConfirmDownload(filename, internalPdfUrl); // Passa a URL interna para download
    } else {
      showError("Não foi possível baixar o PDF.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" /> Visualizar Prontuário
          </DialogTitle>
          <DialogDescription>
            Pré-visualização do prontuário médico. Clique em "Baixar PDF" para salvar o arquivo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden rounded-lg border bg-muted">
          {internalPdfUrl ? (
            <iframe
              src={internalPdfUrl}
              className="w-full h-full min-h-[500px]"
              title="PDF Preview"
              style={{ border: 'none' }}
            />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[500px]">
              <p className="text-muted-foreground">Carregando visualização...</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" /> Fechar
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" /> Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PdfPreviewDialog;