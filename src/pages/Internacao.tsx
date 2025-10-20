import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Internacao = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Internação</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Internar Paciente
        </Button>
      </div>
      <p className="text-muted-foreground">Esta página está pronta para ser refeita.</p>
    </div>
  );
};

export default Internacao;