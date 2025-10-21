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
import { ChevronUp, ChevronDown, GripVertical } from "lucide-react"; // Adicionado GripVertical para indicar reordenação
import { Switch } from "@/components/ui/switch";
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
} from "@/components/ui/collapsible"; // Importar componentes Collapsible

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

  const handleSwitchChange = (id: string, checked: boolean) => {
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

  const moveItem = (index: number, direction: "up" | "down") => {
    setTempConfig((prevConfig) => {
      const newConfig = Array.from(prevConfig);
      const newIndex = direction === "up" ? index - 1 : index + 1;

      if (newIndex >= 0 && newIndex < newConfig.length) {
        const [removed] = newConfig.splice(index, 1);
        newConfig.splice(newIndex, 0, removed);
      }
      return newConfig;
    });
  };

  const handleSave = () => {
    onSave(tempConfig);
    onOpenChange(false);
  };

  // Agrupar itens por categoria para exibição
  const groupedConfig = React.useMemo(() => {
    return tempConfig.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<DashboardItemConfig["category"], DashboardItemConfig[]>);
  }, [tempConfig]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Painel</DialogTitle>
          <DialogDescription>
            Selecione quais cards você deseja ver no painel, a qual aba pertencem e use as setas para reordenar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {Object.keys(groupedConfig).map((categoryKey) => {
            const category = categoryKey as DashboardItemConfig["category"];
            const itemsInCategory = groupedConfig[category];
            
            // Encontrar os índices dos itens dentro do tempConfig original para a função moveItem
            const getOriginalIndex = (itemId: string) => tempConfig.findIndex(item => item.id === itemId);

            return (
              <Collapsible key={category} className="space-y-2 border rounded-md p-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between text-lg font-semibold">
                    {categoryNames[category]} ({itemsInCategory.length})
                    <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  {itemsInCategory.map((item) => {
                    const originalIndex = getOriginalIndex(item.id);
                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center justify-between space-x-2 p-2 rounded-md border bg-card"
                        )}
                      >
                        <div className="flex items-center space-x-2 flex-1">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" /> {/* Ícone de arrastar */}
                          <div className="flex flex-col flex-1">
                            <Label htmlFor={`item-${item.id}`} className="text-base font-medium">
                              {item.name}
                            </Label>
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
                              onClick={() => moveItem(originalIndex, "up")}
                              disabled={originalIndex === 0}
                              className="h-8 w-8"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveItem(originalIndex, "down")}
                              disabled={originalIndex === tempConfig.length - 1}
                              className="h-8 w-8"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <Switch
                            id={`item-${item.id}`}
                            checked={item.isVisible}
                            onCheckedChange={(checked) =>
                              handleSwitchChange(item.id, checked as boolean)
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
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