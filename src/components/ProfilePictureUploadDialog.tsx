"use client";

import React, { useState, useRef } from 'react';
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
import { Image as ImageIcon, Upload, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { showError, showSuccess } from "@/utils/toast";

interface ProfilePictureUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string;
  onSave: (newAvatarUrl: string) => void;
}

const ProfilePictureUploadDialog: React.FC<ProfilePictureUploadDialogProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  onSave,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showError("Por favor, selecione um arquivo de imagem válido.");
        setSelectedFile(null);
        setPreviewUrl(currentAvatarUrl || null);
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showError("A imagem é muito grande. O tamanho máximo permitido é 2MB.");
        setSelectedFile(null);
        setPreviewUrl(currentAvatarUrl || null);
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(currentAvatarUrl || null);
    }
  };

  const handleSave = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onSave(reader.result); // Pass the base64 string
          showSuccess("Foto de perfil atualizada com sucesso!");
          onClose();
        }
      };
      reader.onerror = () => {
        showError("Erro ao ler o arquivo de imagem.");
      };
      reader.readAsDataURL(selectedFile);
    } else if (previewUrl && previewUrl === currentAvatarUrl) {
      // No new file selected, but current avatar is still there, just close
      onClose();
    } else {
      // No file selected and no current avatar, or current avatar was removed
      onSave(""); // Clear avatar
      showSuccess("Foto de perfil removida.");
      onClose();
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input
    }
    showSuccess("Foto de perfil removida. Clique em Salvar para confirmar.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ImageIcon className="h-5 w-5 mr-2" /> Editar Foto de Perfil
          </DialogTitle>
          <DialogDescription>
            Selecione uma nova imagem para o seu perfil.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center mb-4">
            <Avatar className="h-32 w-32 border-4 border-primary shadow-lg">
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt="Preview" />
              ) : (
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <UserIcon className="h-16 w-16" />
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="picture">Escolher Imagem</Label>
            <Input
              id="picture"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>
          {previewUrl && (
            <Button
              variant="outline"
              className="w-full mt-2 text-destructive hover:bg-destructive/10"
              onClick={handleRemovePhoto}
            >
              <XCircle className="h-4 w-4 mr-2" /> Remover Foto Atual
            </Button>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Upload className="h-4 w-4 mr-2" /> Salvar Foto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePictureUploadDialog;