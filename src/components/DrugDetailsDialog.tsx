"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Pill, Dog, Cat, Factory, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DrugInfo {
  id: string;
  name: string;
  active_principle: string;
  manufacturer: string;
  indications: string;
  contraindications: string;
  dosage: {
    dogs: string;
    cats: string;
  };
  presentations: string[];
  photo_url?: string | null;
}

interface DrugDetailsDialogProps {
  drug: DrugInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

const DrugDetailsDialog: React.FC<DrugDetailsDialogProps> = ({ drug, isOpen, onClose }) => {
  if (!drug) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src={drug.photo_url || undefined} alt={drug.name} />
              <AvatarFallback>
                <Pill className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="flex items-center text-2xl">
                {drug.name}
              </DialogTitle>
              <DialogDescription>
                <div className="flex items-center justify-between mt-1">
                  <span>{drug.active_principle}</span>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Factory className="h-4 w-4 mr-2" />
                    <span>{drug.manufacturer}</span>
                  </div>
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <Accordion type="single" collapsible defaultValue="indications" className="w-full">
            <AccordionItem value="indications">
              <AccordionTrigger>Indicações</AccordionTrigger>
              <AccordionContent>{drug.indications}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="contraindications">
              <AccordionTrigger className="text-destructive">
                <AlertTriangle className="h-4 w-4 mr-2" /> Contraindicações
              </AccordionTrigger>
              <AccordionContent>{drug.contraindications}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="dosage">
              <AccordionTrigger>Posologia</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <Dog className="h-4 w-4 mr-2 mt-1 shrink-0" />
                    <p><span className="font-semibold">Cães:</span> {drug.dosage.dogs}</p>
                  </div>
                  <div className="flex items-start">
                    <Cat className="h-4 w-4 mr-2 mt-1 shrink-0" />
                    <p><span className="font-semibold">Gatos:</span> {drug.dosage.cats}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="presentations">
              <AccordionTrigger>Apresentações</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2">
                  {drug.presentations.map(p => <Badge key={p} variant="outline">{p}</Badge>)}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DrugDetailsDialog;