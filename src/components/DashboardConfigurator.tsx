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
import { ChevronDown, GripVertical, PlusCircle, MinusCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"; // Importar componentes de DND

interface DashboardItemConfig {
  id: string;
  name: string;
  isVisible: boolean;
  category: "overview" | "financial" | "animalHealth" | "recentActivity";
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
  animalHealth: "Saúde Animal",
  recentActivity: "Atividade Recente",
};

const DashboardConfigurator: React.FC<DashboardConfiguratorProps> = ({
  open,
  onOpenChange,
  config,
  onSave,
}) => {
  const [tempConfig, setTempConfig] = React.useState<DashboardItemConfig[]>(config);
  const [cardToAddId, setCardToAddId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTempConfig(config);
  }, [config]);

  const handleRemoveCardFromPanel = (id: string) => {
    setTempConfig((prevConfig) =>
      prevConfig.map((item) =>
        item.id === id ? { ...item, isVisible: false } : item
      )
    );
  };

  const handleConfirmAddCardToCategory = (id: string, category: DashboardItemConfig["category"]) => {
    setTempConfig((prevConfig) =>
      prevConfig.map((item) =>
        item.id === id ? { ...item, isVisible: true, category: category } : item
      )
    );
    setCardToAddId(null);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId !== destination.droppableId) {
      // Dragging between different categories is not allowed in this setup
      // The UI prevents this by having separate droppables per category
      return;
    }

    if (source.index === destination.index) {
      return;
    }

    setTempConfig((prevConfig) => {
      const newConfig = Array.from(prevConfig);
      const category = source.droppableId as DashboardItemConfig["category"];

      // Filter items belonging to the current category and are visible
      const itemsInCurrentCategory = newConfig.filter(
        (item) => item.isVisible && item.category === category
      );

      // Reorder items within this filtered list
      const [reorderedItem] = itemsInCurrentCategory.splice(source.index, 1);
      itemsInCurrentCategory.splice(destination.index, 0, reorderedItem);

      // Reconstruct the full config array, maintaining order of other categories and invisible items
      const updatedConfig = newConfig.map(item => {
        const reordered = itemsInCurrentCategory.find(reordered => reordered.id === item.id);
        return reordered || item;
      });

      // To ensure the order within the category is preserved correctly in the main array,
      // we need to place the reordered items back into their original positions relative to other categories.
      // A simpler approach is to sort the entire tempConfig based on the new order of itemsInCurrentCategory.
      const finalConfig = newConfig.sort((a, b) => {
        if (a.category === category && b.category === category && a.isVisible && b.isVisible) {
          const aIndex = itemsInCurrentCategory.findIndex(item => item.id === a.id);
          const bIndex = itemsInCurrentCategory.findIndex(item => item.id === b.id);
          return aIndex - bIndex;
        }
        return 0; // Maintain original relative order for items not in this category or not visible
      });

      return finalConfig;
    });
  };

  const handleSave = () => {
    onSave(tempConfig);
    onOpenChange(false);
  };

  const availableCards = React.useMemo(() => {
    return tempConfig.filter((item) => !item.isVisible);
  }, [tempConfig]);

  const configuredCards = React.useMemo(() => {
    return tempConfig.filter((item) => item.isVisible);
  }, [tempConfig]);

  const groupedConfigured = React.useMemo(() => {
    return configuredCards.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<DashboardItemConfig["category"], DashboardItemConfig[]>);
  }, [configuredCards]);

  const allCategories = Object.keys(categoryNames) as DashboardItemConfig["category"][];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Configurar Painel</DialogTitle>
          <DialogDescription>
            Adicione cards da esquerda para o painel e organize-os na direita.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Left side: Available Cards (sem local definido) */}
          <div className="flex flex-col space-y-4 overflow-y-auto pr-2">
            <h3 className="text-lg font-semibold">Cards Disponíveis</h3>
            <ScrollArea className="flex-1 pr-2">
              {availableCards.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Todos os cards estão no painel.</p>
              ) : (
                <div className="space-y-2">
                  {availableCards.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between space-x-2 p-2 rounded-md border bg-card"
                    >
                      <Label className="text-sm font-medium">{item.name}</Label>
                      <Popover open={cardToAddId === item.id} onOpenChange={(isOpen) => !isOpen && setCardToAddId(null)}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCardToAddId(item.id)}
                            className="h-8 w-8 text-green-600 hover:bg-green-100"
                          >
                            <PlusCircle className="h-4 w-4" />
                            <span className="sr-only">Adicionar</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-2">
                          <p className="text-sm font-medium mb-2">Adicionar a qual categoria?</p>
                          <Select
                            onValueChange={(value: DashboardItemConfig["category"]) =>
                              handleConfirmAddCardToCategory(item.id, value)
                            }
                          >
                            <SelectTrigger className="w-full h-8 text-sm">
                              <SelectValue placeholder="Selecionar Categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(categoryNames).map(([val, name]) => (
                                <SelectItem key={val} value={val}>
                                  {name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </PopoverContent>
                      </Popover>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Right side: Configured Cards (quando for definido) */}
          <div className="flex flex-col space-y-4 overflow-y-auto pl-2">
            <h3 className="text-lg font-semibold">Cards no Painel</h3>
            <ScrollArea className="flex-1 pl-2">
              {configuredCards.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhum card no painel. Adicione cards da seção 'Cards Disponíveis'.</p>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  {allCategories.map((category) => {
                    const items = groupedConfigured[category] || [];
                    if (items.length === 0) return null;
                    return (
                      <Collapsible key={category} className="space-y-2 border rounded-md p-2 mb-4">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between text-base font-medium">
                            {categoryNames[category]} ({items.length})
                            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 pt-2">
                          <Droppable droppableId={category}>
                            {(provided) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-2"
                              >
                                {items.map((item, index) => (
                                  <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={cn(
                                          "flex items-center justify-between space-x-2 p-2 rounded-md border bg-card",
                                          snapshot.isDragging && "shadow-lg bg-accent"
                                        )}
                                      >
                                        <div className="flex items-center space-x-2 flex-1">
                                          <span {...provided.dragHandleProps}>
                                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                          </span>
                                          <div className="flex flex-col flex-1">
                                            <Label className="text-sm font-medium">{item.name}</Label>
                                            <p className="text-xs text-muted-foreground mt-1">Categoria: {categoryNames[item.category]}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveCardFromPanel(item.id)}
                                            className="h-8 w-8 text-red-600 hover:bg-red-100"
                                          >
                                            <MinusCircle className="h-4 w-4" />
                                            <span className="sr-only">Remover do Painel</span>
                                          </Button>
                                        </div>
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
              )}
            </ScrollArea>
          </div>
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