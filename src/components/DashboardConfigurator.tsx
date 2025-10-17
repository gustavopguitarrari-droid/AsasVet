import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"; // Importando DND
import { GripVertical } from "lucide-react"; // Importando ícone de arrastar

interface DashboardItemConfig {
  id: string;
  name: string;
  isVisible: boolean;
}

interface DashboardConfiguratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: DashboardItemConfig[];
  onSave: (newConfig: DashboardItemConfig[]) => void;
}

const DashboardConfigurator: React.FC<DashboardConfiguratorProps> = ({
  open,
  onOpenChange,
  config,
  onSave,
}) => {
  const [tempConfig, setTempConfig] = React.useState<DashboardItemConfig[]>(config);

  React.useEffect(() => {
    setTempConfig(config);
  }, [config]);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setTempConfig((prevConfig) =>
      prevConfig.map((item) =>
        item.id === id ? { ...item, isVisible: checked } : item
      )
    );
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const reorderedConfig = Array.from(tempConfig);
    const [removed] = reorderedConfig.splice(result.source.index, 1);
    reorderedConfig.splice(result.destination.index, 0, removed);

    setTempConfig(reorderedConfig);
  };

  const handleSave = () => {
    onSave(tempConfig);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar Painel</DialogTitle>
          <DialogDescription>
            Selecione quais cards você deseja ver no painel e arraste para reordenar.
          </DialogDescription>
        </DialogHeader>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="dashboard-items">
            {(provided) => (
              <div
                className="grid gap-4 py-4"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {tempConfig.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "flex items-center space-x-2 p-2 rounded-md border",
                          snapshot.isDragging && "bg-accent"
                        )}
                      >
                        <div {...provided.dragHandleProps} className="cursor-grab">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Checkbox
                          id={`item-${item.id}`}
                          checked={item.isVisible}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(item.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={`item-${item.id}`} className="text-base flex-1">
                          {item.name}
                        </Label>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardConfigurator;