import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Importar componentes do Dialog

const Internacao = () => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false); // Estado para controlar a abertura do diálogo

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Internação</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold">
              <PlusCircle className="mr-2 h-4 w-4" /> Internar Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Internar Novo Paciente</DialogTitle>
            </DialogHeader>
            {/* Conteúdo do formulário de internação virá aqui */}
            <p className="text-muted-foreground">Formulário de internação será adicionado aqui.</p>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-muted-foreground">Esta página está pronta para ser refeita.</p>
    </div>
  );
};

export default Internacao;