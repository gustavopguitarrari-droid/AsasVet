"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Download } from 'lucide-react';

interface ImagePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  imageAlt: string;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageAlt,
}) => {
  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `imagem_${imageAlt.replace(/\s/g, '_')}.png`; // Nome do arquivo para download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" /> Pré-visualizar Imagem
          </DialogTitle>
          <DialogDescription>
            {imageAlt}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageAlt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          ) : (
            <p className="text-muted-foreground">Nenhuma imagem para exibir.</p>
          )}
        </div>
        {imageUrl && (
          <div className="flex justify-end p-4 border-t">
            <Button onClick={handleDownload} variant="outline" className="rounded-lg">
              <Download className="h-4 w-4 mr-2" /> Baixar Imagem
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreviewDialog;