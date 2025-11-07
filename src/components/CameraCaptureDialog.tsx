"use client";

import React, { useRef, useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, CheckCircle } from 'lucide-react';
import { showError } from '@/utils/toast';

interface CameraCaptureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

const CameraCaptureDialog: React.FC<CameraCaptureDialogProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoTaken, setPhotoTaken] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setPhotoTaken(null);
      setIsCameraReady(false);
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setPhotoTaken(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
          videoRef.current?.play();
        };
      }
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      showError("Não foi possível acessar a câmera. Verifique as permissões.");
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/png');
        setPhotoTaken(imageDataUrl);
        stopCamera(); // Para a câmera após tirar a foto
      }
    }
  };

  const handleConfirm = () => {
    if (photoTaken) {
      onCapture(photoTaken);
      onClose();
    }
  };

  const handleRetake = () => {
    setPhotoTaken(null);
    startCamera();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] flex flex-col items-center rounded-xl">
        <DialogHeader className="w-full text-center">
          <DialogTitle className="flex items-center justify-center">
            <Camera className="h-5 w-5 mr-2" /> Capturar Foto
          </DialogTitle>
          <DialogDescription>
            {photoTaken ? "Revise a foto ou tire outra." : "Posicione-se em frente à câmera e capture a imagem."}
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
          {!isCameraReady && !photoTaken && isOpen && (
            <p className="text-muted-foreground">Iniciando câmera...</p>
          )}
          {photoTaken ? (
            <img src={photoTaken} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <video ref={videoRef} className="w-full h-full object-cover" playsInline autoPlay muted />
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <DialogFooter className="flex-col sm:flex-row sm:justify-center sm:space-x-2 w-full mt-4">
          {photoTaken ? (
            <>
              <Button variant="outline" onClick={handleRetake} className="w-full sm:w-auto rounded-lg">
                <X className="h-4 w-4 mr-2" /> Tirar Outra
              </Button>
              <Button onClick={handleConfirm} className="w-full sm:w-auto rounded-lg">
                <CheckCircle className="h-4 w-4 mr-2" /> Confirmar Foto
              </Button>
            </>
          ) : (
            <Button onClick={takePhoto} disabled={!isCameraReady} className="w-full sm:w-auto rounded-lg">
              <Camera className="h-4 w-4 mr-2" /> Capturar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CameraCaptureDialog;