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
import { ChevronDown, GripVertical } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { showSuccess } from "@/utils/toast";
import { Switch } from "@/components/ui/switch";

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

const categoryNames = {
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

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    setTempConfig(prevConfig => {
      const newConfig = Array.from(prevConfig);
      const draggedItemIndex = newConfig.findIndex(item => item.id === draggableId);
      if (draggedItemIndex === -1) return prevConfig;

      const [reorderedItem] = newConfig.splice(draggedItemIndex, 1);
      reorderedItem.category = destination.droppableId as DashboardItemConfig["category"];
      newConfig.splice(destination.index, 0, reorderedItem);

      // Re-order items within each category
      Object.keys(categoryNames).forEach(category => {
        const categoryItems = newConfig.filter(item => item.category === category);
        categoryItems.forEach((item, index) => {
          const originalIndex = newConfig.findIndex(cfg => cfg.id === item.id);
          if (originalIndex !== -1) {
            newConfig[originalIndex].order = index;
          }
        });
      });

      return newConfig;
    });
  };

  const handleSave = () => {
    onSave(tempConfig);
    onOpenChange(false);
  };

  const allCategories = Object.keys(categoryNames) as DashboardItemConfig["category"][];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Configurar Painel</DialogTitle>
          <DialogDescription>
            Arraste para reordenar ou mover cards entre categorias. Use o interruptor para mostrar ou esconder.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <DragDropContext onDragEnd={onDragEnd}>
            {allCategories.map((category) => {
              const itemsInCategory = tempConfig
                .filter(item => item.category === category)
                .sort((a, b) => a.order - b.order);

              return (
                <Collapsible key={category} defaultOpen={true} className="space-y-2 border rounded-md p-2 mb-4">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between text-base font-medium">
                      {categoryNames[category]}
                      <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Droppable droppableId={category}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={cn(
                            "min-h-[50px] p-2 rounded-md space-y-2",
                            snapshot.isDraggingOver && "bg-accent/50"
                          )}
                        >
                          {itemsInCategory.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    "flex items-center justify-between space-x-2 p-3 rounded-md border bg-card transition-opacity",
                                    snapshot.isDragging && "shadow-lg",
                                    !item.isVisible && "opacity-50"
                                  )}
                                >
                                  <div className="flex items-center space-x-2">
                                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                    <Label htmlFor={`switch-${item.id}`} className="text-sm font-medium">
                                      {item.name}
                                    </Label>
                                  </div>
                                  <Switch
                                    id={`switch-${item.id}`}
                                    checked={item.isVisible}
                                    onCheckedChange={(checked) => handleVisibilityChange(item.id, checked)}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </DragDropContext>
        </ScrollArea>
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