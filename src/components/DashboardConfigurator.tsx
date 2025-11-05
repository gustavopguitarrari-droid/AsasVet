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
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { showSuccess, showError } from "@/utils/toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  const [cardToAddId, setCardToAddId] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState<"lateral" | "superior">(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('layoutDirection') === 'vertical' ? 'superior' : 'lateral');
    }
    return 'lateral';
  });

  React.useEffect(() => {
    const initializedConfig = config.map((item, index) => ({
      ...item,
      order: item.order !== undefined ? item.order : index,
    }));
    setTempConfig(initializedConfig);
  }, [config]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('layoutDirection', menuPosition === 'superior' ? 'vertical' : 'horizontal');
    }
  }, [menuPosition]);

  const handleRemoveCardFromPanel = (id: string) => {
    setTempConfig((prevConfig) => {
      const updatedConfig = prevConfig.map((item) =>
        item.id === id ? { ...item, isVisible: false, order: -1 } : item
      );
      const removedItem = prevConfig.find(item => item.id === id);
      if (removedItem && removedItem.isVisible) {
        const categoryItems = updatedConfig
          .filter(item => item.isVisible && item.category === removedItem.category)
          .sort((a, b) => a.order - b.order);
        categoryItems.forEach((item, idx) => {
          const originalIndex = updatedConfig.findIndex(cfg => cfg.id === item.id);
          if (originalIndex !== -1) updatedConfig[originalIndex].order = idx;
        });
      }
      showSuccess("Card removido do painel.");
      return updatedConfig;
    });
  };

  const handleAddCardToCategory = (id: string, category: DashboardItemConfig["category"]) => {
    setTempConfig((prevConfig) => {
      const updatedConfig = prevConfig.map((item) =>
        item.id === id ? { ...item, isVisible: true, category: category } : item
      );
      const maxOrderInCategory = Math.max(
        -1,
        ...updatedConfig
          .filter(item => item.isVisible && item.category === category)
          .map(item => item.order)
      );
      const newOrder = maxOrderInCategory + 1;

      const finalConfig = updatedConfig.map(item =>
        item.id === id ? { ...item, order: newOrder } : item
      );
      showSuccess("Card adicionado ao painel!");
      return finalConfig;
    });
    setCardToAddId(null);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    setTempConfig(prevConfig => {
      const newConfig = Array.from(prevConfig);
      const draggedItemIndex = newConfig.findIndex(item => item.id === draggableId);
      const draggedItem = { ...newConfig[draggedItemIndex] };

      const sourceCategoryItems = newConfig
        .filter(item => item.isVisible && item.category === source.droppableId)
        .sort((a, b) => a.order - b.order);
      
      sourceCategoryItems.splice(source.index, 1);

      if (source.droppableId !== destination.droppableId) {
        draggedItem.category = destination.droppableId as DashboardItemConfig["category"];
      }

      const destinationCategoryItems = newConfig
        .filter(item => item.isVisible && item.category === destination.droppableId && item.id !== draggableId)
        .sort((a, b) => a.order - b.order);
      
      destinationCategoryItems.splice(destination.index, 0, draggedItem);

      newConfig[draggedItemIndex] = draggedItem;

      if (source.droppableId !== destination.droppableId) {
        sourceCategoryItems.forEach((item, idx) => {
          const originalIndex = newConfig.findIndex(cfg => cfg.id === item.id);
          if (originalIndex !== -1) newConfig[originalIndex].order = idx;
        });
      }

      destinationCategoryItems.forEach((item, idx) => {
        const originalIndex = newConfig.findIndex(cfg => cfg.id === item.id);
        if (originalIndex !== -1) newConfig[originalIndex].order = idx;
      });

      return newConfig.sort((a, b) => {
        if (a.isVisible === b.isVisible) {
          if (a.category === b.category) {
            return a.order - b.order;
          }
          return a.category.localeCompare(b.category);
        }
        return a.isVisible ? -1 : 1;
      });
    });
  };

  const handleSave = () => {
    onSave(tempConfig);
    onOpenChange(false);
    window.location.reload();
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
            Personalize a exibição dos cards e a posição do menu de navegação.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
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
                              handleAddCardToCategory(item.id, value)
                            }
                            defaultValue="overview"
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

          <div className="flex flex-col space-y-4 overflow-y-auto pl-2">
            <h3 className="text-lg font-semibold">Cards no Painel</h3>
            <ScrollArea className="flex-1 pl-2">
              {configuredCards.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Nenhum card no painel. Adicione cards da seção 'Cards Disponíveis'.</p>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  {allCategories.map((category) => {
                    const items = (groupedConfigured[category] || []).sort((a, b) => a.order - b.order);
                    return (
                      <Collapsible key={category} defaultOpen={true} className="space-y-2 border rounded-md p-2 mb-4">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="w-full justify-between text-base font-medium">
                            {categoryNames[category]} ({items.length})
                            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-2 pt-2">
                          <Droppable droppableId={category}>
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={cn(
                                  "min-h-[50px] p-2 rounded-md",
                                  snapshot.isDraggingOver && "bg-accent/30"
                                )}
                              >
                                {items.map((item, index) => (
                                  <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                          ...provided.draggableProps.style,
                                          zIndex: snapshot.isDragging ? 9999 : 'auto',
                                        }}
                                      >
                                        <div
                                          className={cn(
                                            "flex items-center justify-between space-x-2 p-2 rounded-md border bg-card mb-2",
                                            snapshot.isDragging && "shadow-lg bg-accent z-[9999]"
                                          )}
                                        >
                                          <div className="flex items-center space-x-2 flex-1">
                                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
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
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-2">Posição do Menu de Navegação</h3>
          <RadioGroup
            value={menuPosition}
            onValueChange={(value: "lateral" | "superior") => setMenuPosition(value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="lateral" id="menu-lateral" />
              <Label htmlFor="menu-lateral">Lateral</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="superior" id="menu-superior" />
              <Label htmlFor="menu-superior">Superior</Label>
            </div>
          </RadioGroup>
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