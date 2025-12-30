"use client";

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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardItemConfig {
  id: string;
  name: string;
  isVisible: boolean;
  category: "overview" | "financial" | "recentActivity";
  order: number;
}

interface DashboardConfiguratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: DashboardItemConfig[];
  onSave: (newConfig: DashboardItemConfig[]) => void;
}

const categoryNames: Record<DashboardItemConfig["category"], string> = {
  overview: "Visão Geral",
  financial: "Financeiro",
  recentActivity: "Atividade Recente",
};

const DashboardConfigurator: React.FC<DashboardConfiguratorProps> = ({
  open,
  onOpenChange,
  config,
  onSave,
}) => {
  const [tempConfig, setTempConfig] = React.useState<DashboardItemConfig[]>(config);

  React.useEffect(() => {
    const initializedConfig = config.map((item, index) => ({
      ...item,
      order: item.order !== undefined ? item.order : index,
    }));
    setTempConfig(initializedConfig);
  }, [config]);

  const handleVisibilityChange = (id: string, checked: boolean) => {
    setTempConfig(prevConfig =>
      prevConfig.map(item =>
        item.id === id ? { ...item, isVisible: checked } : item
      )
    );
  };

  const handleCategoryChange = (id: string, newCategory: DashboardItemConfig["category"]) => {
    setTempConfig(prevConfig =>
      prevConfig.map(item =>
        item.id === id ? { ...item, category: newCategory } : item
      )
    );
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    setTempConfig(prevConfig => {
      const sortedConfig = [...prevConfig].sort((a, b) => a.order - b.order);
      const [reorderedItem] = sortedConfig.splice(source.index, 1);
      sortedConfig.splice(destination.index, 0, reorderedItem);

      // Update the order property for all items to reflect the new list order
      return sortedConfig.map((item, index) => ({ ...item, order: index }));
    });
  };

  const handleSave = () => {
    onSave(tempConfig);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Configurar Painel</DialogTitle>
          <DialogDescription>
            Arraste para reordenar, selecione a aba e ative ou desative os cards do seu painel.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="all-items">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {tempConfig
                    .sort((a, b) => a.order - b.order)
                    .map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "flex items-center justify-between space-x-4 p-3 rounded-md border bg-card transition-shadow",
                              snapshot.isDragging && "shadow-lg"
                            )}
                          >
                            <div className="flex items-center space-x-2 flex-1">
                              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                              <Label htmlFor={`switch-${item.id}`} className="text-sm font-medium">
                                {item.name}
                              </Label>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Select
                                value={item.category}
                                onValueChange={(value) => handleCategoryChange(item.id, value as any)}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Selecione a aba" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(categoryNames).map(([key, name]) => (
                                    <SelectItem key={key} value={key}>{name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Switch
                                id={`switch-${item.id}`}
                                checked={item.isVisible}
                                onCheckedChange={(checked) => handleVisibilityChange(item.id, checked)}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
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