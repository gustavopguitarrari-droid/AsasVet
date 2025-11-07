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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, X } from 'lucide-react';

interface PdfDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFilename: string;
  onConfirmDownload: (filename: string) => void;
}

const PdfDownloadDialog: React.FC<PdfDownloadDialogProps> = ({
  isOpen,
  onClose,
  defaultFilename,
  onConfirmDownload,
}) => {
  const [filename, setFilename] = useState(defaultFilename);

  useEffect(() => {
    if (isOpen) {
      setFilename(defaultFilename);
    }
  }, [isOpen, defaultFilename]);

  const handleConfirm = () => {
    if (filename.trim()) {
      onConfirmDownload(filename.trim());
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" /> Baixar Prontuário PDF
          </DialogTitle>
          <DialogDescription>
            Edite o nome do arquivo antes de fazer o download.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="filename">Nome do Arquivo</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
              className="rounded-lg"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-lg">
            <X className="h-4 w-4 mr-2" /> Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!filename.trim()} className="rounded-lg">
            <Download className="h-4 w-4 mr-2" /> Baixar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PdfDownloadDialog;