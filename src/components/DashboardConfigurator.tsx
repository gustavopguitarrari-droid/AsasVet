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
import { ChevronUp, ChevronDown, GripVertical } from "lucide-react";
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
import { Switch } from "@/components/ui/switch"; // Importar Switch

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

  React.useEffect(() => {
    setTempConfig(config);
  }, [config]);

  const handleToggleVisibility = (id: string, checked: boolean) => {
    setTempConfig((prevConfig) =>
      prevConfig.map((item) =>
        item.id === id ? { ...item, isVisible: checked } : item
      )
    );
  };

  const handleCategoryChange = (id: string, newCategory: DashboardItemConfig["category"]) => {
    setTempConfig((prevConfig) =>
      prevConfig.map((item) =>
        item.id === id ? { ...item, category: newCategory } : item
      )
    );
  };

  const moveItem = (id: string, direction: "up" | "down") => {
    setTempConfig((prevConfig) => {
      const newConfig = Array.from(prevConfig);
      const currentIndex = newConfig.findIndex((item) => item.id === id);

      if (currentIndex === -1 || !newConfig[currentIndex].isVisible) return prevConfig;

      const currentItem = newConfig[currentIndex];
      const itemsInSameCategoryAndVisible = newConfig.filter(
        (item) => item.isVisible && item.category === currentItem.category
      );
      const currentItemIndexInCategory = itemsInSameCategoryAndVisible.findIndex(
        (item) => item.id === id
      );

      if (currentItemIndexInCategory === -1) return prevConfig;

      let targetItemIndexInCategory = -1;
      if (direction === "up") {
        if (currentItemIndexInCategory > 0) {
          targetItemIndexInCategory = currentItemIndexInCategory - 1;
        }
      } else {
        // direction === "down"
        if (currentItemIndexInCategory < itemsInSameCategoryAndVisible.length - 1) {
          targetItemIndexInCategory = currentItemIndexInCategory + 1;
        }
      }

      if (targetItemIndexInCategory !== -1) {
        const itemToSwapWith = itemsInSameCategoryAndVisible[targetItemIndexInCategory];
        const originalIndexToSwapWith = newConfig.findIndex(
          (item) => item.id === itemToSwapWith.id
        );

        // Perform the swap in the main newConfig array
        [newConfig[currentIndex], newConfig[originalIndexToSwapWith]] = [
          newConfig[originalIndexToSwapWith],
          newConfig[currentIndex],
        ];
      }
      return newConfig;
    });
  };

  const canMoveUp = (id: string) => {
    const currentIndex = tempConfig.findIndex((item) => item.id === id);
    if (currentIndex === -1 || !tempConfig[currentIndex].isVisible) return false;

    const currentItem = tempConfig[currentIndex];
    const itemsInSameCategoryAndVisible = tempConfig.filter(
      (item) => item.isVisible && item.category === currentItem.category
    );
    const currentItemIndexInCategory = itemsInSameCategoryAndVisible.findIndex(
      (item) => item.id === id
    );

    return currentItemIndexInCategory > 0;
  };

  const canMoveDown = (id: string) => {
    const currentIndex = tempConfig.findIndex((item) => item.id === id);
    if (currentIndex === -1 || !tempConfig[currentIndex].isVisible) return false;

    const currentItem = tempConfig[currentIndex];
    const itemsInSameCategoryAndVisible = tempConfig.filter(
      (item) => item.isVisible && item.category === currentItem.category
    );
    const currentItemIndexInCategory = itemsInSameCategoryAndVisible.findIndex(
      (item) => item.id === id
    );

    return currentItemIndexInCategory < itemsInSameCategoryAndVisible.length - 1;
  };

  const handleSave = () => {
    onSave(tempConfig);
    onOpenChange(false);
  };

  const groupedAllCards = React.useMemo(() => {
    return tempConfig.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<DashboardItemConfig["category"], DashboardItemConfig[]>);
  }, [tempConfig]);

  const allCategories = Object.keys(categoryNames) as DashboardItemConfig["category"][];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Configurar Painel</DialogTitle>
          <DialogDescription>
            Gerencie a visibilidade, categoria e ordem dos cards do seu painel.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2">
          {allCategories.map((category) => {
            const items = groupedAllCards[category] || [];
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
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between space-x-2 p-2 rounded-md border bg-card"
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                        <div className="flex flex-col flex-1">
                          <Label className="text-sm font-medium">{item.name}</Label>
                          <Select
                            value={item.category}
                            onValueChange={(value: DashboardItemConfig["category"]) =>
                              handleCategoryChange(item.id, value)
                            }
                          >
                            <SelectTrigger className="w-[180px] h-8 text-sm mt-1">
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
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex flex-col items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveItem(item.id, "up")}
                            disabled={!canMoveUp(item.id)}
                            className="h-8 w-8"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveItem(item.id, "down")}
                            disabled={!canMoveDown(item.id)}
                            className="h-8 w-8"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <Switch
                          checked={item.isVisible}
                          onCheckedChange={(checked) => handleToggleVisibility(item.id, checked)}
                          aria-label={`Toggle visibility for ${item.name}`}
                        />
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
          {tempConfig.length === 0 && (
            <p className="text-muted-foreground text-center py-4">Nenhum card disponível para configuração.</p>
          )}
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