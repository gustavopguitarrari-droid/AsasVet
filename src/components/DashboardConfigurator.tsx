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
import { ChevronUp, ChevronDown, GripVertical, PlusCircle, MinusCircle } from "lucide-react";
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

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    setTempConfig((prevConfig) =>
      prevConfig.map((item) =>
        item.id === id ? { ...item, isVisible: isVisible } : item
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

  const canMoveUp = (id: string) => {
    const currentIndex = tempConfig.findIndex((item) => item.id === id);
    if (currentIndex === -1 || !tempConfig[currentIndex].isVisible) return false;

    for (let i = currentIndex - 1; i >= 0; i--) {
      if (tempConfig[i].isVisible) {
        return true; // Encontrou um item visível acima para trocar
      }
    }
    return false; // Nenhum item visível acima
  };

  const canMoveDown = (id: string) => {
    const currentIndex = tempConfig.findIndex((item) => item.id === id);
    if (currentIndex === -1 || !tempConfig[currentIndex].isVisible) return false;

    for (let i = currentIndex + 1; i < tempConfig.length; i++) {
      if (tempConfig[i].isVisible) {
        return true; // Encontrou um item visível abaixo para trocar
      }
    }
    return false; // Nenhum item visível abaixo
  };

  const moveItem = (id: string, direction: "up" | "down") => {
    setTempConfig((prevConfig) => {
      const newConfig = Array.from(prevConfig);
      const currentIndex = newConfig.findIndex((item) => item.id === id);

      if (currentIndex === -1) return prevConfig;

      let targetIndex = -1;
      if (direction === "up") {
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (newConfig[i].isVisible) { // Apenas troca com outros itens visíveis
            targetIndex = i;
            break;
          }
        }
      } else { // direction === "down"
        for (let i = currentIndex + 1; i < newConfig.length; i++) {
          if (newConfig[i].isVisible) { // Apenas troca com outros itens visíveis
            targetIndex = i;
            break;
          }
        }
      }

      if (targetIndex !== -1) {
        const [removed] = newConfig.splice(currentIndex, 1);
        newConfig.splice(targetIndex, 0, removed);
      }
      return newConfig;
    });
  };

  const handleSave = () => {
    onSave(tempConfig);
    onOpenChange(false);
  };

  const availableItems = tempConfig.filter((item) => !item.isVisible);
  // const selectedItems = tempConfig.filter((item) => item.isVisible); // Não é mais usado diretamente para renderização

  const groupedSelected = React.useMemo(() => {
    const orderedSelected: DashboardItemConfig[] = [];
    tempConfig.forEach(item => {
      if (item.isVisible) {
        orderedSelected.push(item);
      }
    });

    return orderedSelected.reduce((acc, item) => {
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Configurar Painel</DialogTitle>
          <DialogDescription>
            Selecione quais cards você deseja ver no painel e reordene-os.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Lado Esquerdo: Opções Disponíveis (lista plana) */}
          <div className="flex flex-col space-y-4 overflow-y-auto pr-2">
            <h3 className="text-lg font-semibold">Opções Disponíveis ({availableItems.length})</h3>
            <div className="space-y-2">
              {availableItems.length === 0 ? (
                <p className="text-muted-foreground text-sm">Todos os cards estão selecionados.</p>
              ) : (
                availableItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between space-x-2 p-2 rounded-md border bg-card"
                  >
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleVisibility(item.id, true)}
                      className="h-8 w-8 text-green-600 hover:bg-green-100"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span className="sr-only">Adicionar</span>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lado Direito: Cards Selecionados (agrupados por categoria) */}
          <div className="flex flex-col space-y-4 overflow-y-auto pl-2">
            <h3 className="text-lg font-semibold">Cards Selecionados</h3>
            {allCategories.map((category) => {
              const items = groupedSelected[category] || [];
              if (items.length === 0) return null;
              return (
                <Collapsible key={category} className="space-y-2 border rounded-md p-2">
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleVisibility(item.id, false)}
                            className="h-8 w-8 text-red-600 hover:bg-red-100"
                          >
                            <MinusCircle className="h-4 w-4" />
                            <span className="sr-only">Remover</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
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