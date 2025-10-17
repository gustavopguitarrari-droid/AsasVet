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
import { ChevronUp, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Importar componentes de Select

interface DashboardItemConfig {
  id: string;
  name: string;
  isVisible: boolean;
  category: "overview" | "financial" | "animalHealth" | "recentActivity"; // Adicionar nova categoria
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

  const handleSwitchChange = (id: string, checked: boolean) => {
    setTempConfig((prevConfig) =>
      prevConfig.map((item) =>
        item.id === id ? { ...item, isVisible: checked } : item
      )
    );
  };

  const handleCategoryChange = (id: string, newCategory: "overview" | "financial" | "animalHealth" | "recentActivity") => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl"> {/* Aumentar largura para acomodar o select */}
        <DialogHeader>
          <DialogTitle>Configurar Painel</DialogTitle>
          <DialogDescription>
            Selecione quais cards você deseja ver no painel, a qual aba pertencem e use as setas para reordenar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
          {tempConfig.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center justify-between space-x-2 p-2 rounded-md border"
              )}
            >
              <div className="flex items-center space-x-2 flex-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                  className="h-8 w-8"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => moveItem(index, "down")}
                  disabled={index === tempConfig.length - 1}
                  className="h-8 w-8"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Label htmlFor={`item-${item.id}`} className="text-base flex-1 min-w-[120px]">
                  {item.name}
                </Label>
                <Select
                  value={item.category}
                  onValueChange={(value: "overview" | "financial" | "animalHealth" | "recentActivity") =>
                    handleCategoryChange(item.id, value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecionar Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Visão Geral</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                    <SelectItem value="animalHealth">Saúde Animal</SelectItem>
                    <SelectItem value="recentActivity">Atividade Recente</SelectItem> {/* Nova opção */}
                  </SelectContent>
                </Select>
              </div>
              <Switch
                id={`item-${item.id}`}
                checked={item.isVisible}
                onCheckedChange={(checked) =>
                  handleSwitchChange(item.id, checked as boolean)
                }
              />
            </div>
          ))}
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