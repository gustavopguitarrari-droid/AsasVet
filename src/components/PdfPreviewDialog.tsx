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
  pdfBlob: Blob | null;
  filename: string;
  onConfirmDownload: (filename: string) => void;
}

const PdfPreviewDialog: React.FC<PdfPreviewDialogProps> = ({
  isOpen,
  onClose,
  pdfBlob,
  filename,
  onConfirmDownload,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      
      // Clean up the object URL when the component unmounts or blob changes
      return () => URL.revokeObjectURL(url);
    } else {
      setPdfUrl(null);
    }
  }, [pdfBlob]);

  const handleDownload = () => {
    if (pdfBlob) {
      onConfirmDownload(filename);
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
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
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