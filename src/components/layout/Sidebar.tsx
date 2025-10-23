import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  PawPrint,
  CalendarDays, // Usado para Agenda
  ClipboardList, // Novo ícone para Consultas
  DollarSign,
  Plus,
  Stethoscope,
  ArrowLeftToLine,
  ArrowRightToLine,
  ReceiptText,
  Package,
  FolderOpen, // NOVO: Ícone para a categoria Cadastros
  ChevronDown, // NOVO: Ícone para o menu expansível
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Collapsible, // NOVO: Componentes para menu expansível
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavItem {
  name: string;
  icon: React.ElementType;
  path?: string; // Path é opcional para itens pai (como 'Cadastros')
  subItems?: NavItem[]; // Sub-itens para menus aninhados
}

const navItems: NavItem[] = [
  {
    name: "Painel",
    icon: LayoutDashboard,
    path: "/painel",
  },
  {
    name: "Cadastros", // Nova categoria
    icon: FolderOpen,
    subItems: [
      { name: "Animais", icon: PawPrint, path: "/pets" },
      { name: "Equipe", icon: Stethoscope, path: "/veterinarios" },
      { name: "Tutores", icon: Users, path: "/clients" }, // Renomeado de 'Clientes' para 'Tutores'
    ],
  },
  {
    name: "Consultas",
    icon: ClipboardList,
    path: "/consultas",
  },
  {
    name: "Internação",
    icon: Plus,
    path: "/internacao",
  },
  {
    name: "Agenda",
    icon: CalendarDays,
    path: "/medical-records",
  },
  {
    name: "Estoque",
    icon: Package,
    path: "/estoque",
  },
  {
    name: "Financeiro",
    icon: DollarSign,
    path: "/financeiro",
  },
  {
    name: "Caixa",
    icon: ReceiptText,
    path: "/caixa",
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  // Estado para gerenciar a abertura/fechamento do menu "Cadastros"
  const [isCadastrosOpen, setIsCadastrosOpen] = React.useState(false);

  // Verifica se algum sub-item de "Cadastros" está ativo
  const isCadastrosParentActive = navItems.find(item => item.name === "Cadastros")?.subItems?.some(
    subItem => location.pathname === subItem.path
  );

  // Efeito para abrir o menu "Cadastros" se um de seus sub-itens estiver ativo
  React.useEffect(() => {
    if (isCadastrosParentActive && !isCollapsed) {
      setIsCadastrosOpen(true);
    } else if (!isCadastrosParentActive && !isCollapsed) {
      // Opcionalmente, fechar se nenhum sub-item estiver ativo e não estiver recolhido
      // setIsCadastrosOpen(false);
    }
  }, [location.pathname, isCadastrosParentActive, isCollapsed]);

  return (
    <div className="relative flex h-full flex-col overflow-y-auto border-r sidebar-gradient-bg p-4 text-sidebar-foreground shadow-sm">
      <Link to="/painel" className="mb-6 flex items-center justify-center text-4xl font-bold text-white cursor-pointer">
        {!isCollapsed && "AsasVet"}{" "}
        <PawPrint className={cn("h-10 w-10 text-white", !isCollapsed && "ml-2")} strokeWidth={2.5} />
      </Link>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          // Determina se o item atual (ou qualquer um de seus sub-itens) está ativo
          const isActive = item.path
            ? location.pathname === item.path
            : item.subItems?.some(sub => location.pathname === sub.path);

          if (item.subItems) {
            return (
              <Collapsible
                key={item.name}
                open={isCadastrosOpen && !isCollapsed} // Abre apenas se não estiver recolhido
                onOpenChange={setIsCadastrosOpen}
                className="space-y-2"
              >
                <Tooltip delayDuration={0}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "text-sidebar-foreground",
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        isCollapsed
                          ? "h-14 w-14 rounded-full flex items-center justify-center"
                          : "w-full justify-start text-xl",
                        isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                      )}
                      // Permite alternar apenas se o sidebar não estiver recolhido
                      onClick={() => !isCollapsed && setIsCadastrosOpen(!isCadastrosOpen)}
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center",
                          !isCollapsed && "w-14 h-14 rounded-full mr-3",
                          isActive && "bg-sidebar-primary"
                        )}
                      >
                        <item.icon className="h-8 w-8" strokeWidth={3.5} />
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className={cn(isActive && "text-sidebar-primary-foreground")}>
                            {item.name}
                          </span>
                          <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", isCadastrosOpen && "rotate-180")} />
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  {isCollapsed && <TooltipContent side="right">{item.name}</TooltipContent>}
                </Tooltip>
                {!isCollapsed && ( // Renderiza o conteúdo apenas se o sidebar não estiver recolhido
                  <CollapsibleContent className="space-y-1 pl-10"> {/* Recuo para sub-itens */}
                    {item.subItems.map((subItem) => (
                      <Button
                        key={subItem.name}
                        asChild
                        variant="ghost"
                        className={cn(
                          "text-sidebar-foreground",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          "w-full justify-start text-lg", // Fonte ligeiramente menor para sub-itens
                          location.pathname === subItem.path && "bg-sidebar-primary text-sidebar-primary-foreground"
                        )}
                      >
                        <Link to={subItem.path!} className="flex items-center">
                          <subItem.icon className="h-6 w-6 mr-2" strokeWidth={2.5} /> {/* Ícone menor para sub-itens */}
                          <span className={cn(location.pathname === subItem.path && "text-sidebar-primary-foreground")}>
                            {subItem.name}
                          </span>
                        </Link>
                      </Button>
                    ))}
                  </CollapsibleContent>
                )}
              </Collapsible>
            );
          } else {
            // Renderiza itens normais (sem sub-itens)
            return (
              <Tooltip key={item.name} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    className={cn(
                      "text-sidebar-foreground",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isCollapsed
                        ? "h-14 w-14 rounded-full flex items-center justify-center"
                        : "w-full justify-start text-xl",
                      isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                    )}
                  >
                    <Link to={item.path!} className="flex items-center">
                      <div
                        className={cn(
                          "flex items-center justify-center",
                          !isCollapsed && "w-14 h-14 rounded-full mr-3",
                          isActive && "bg-sidebar-primary"
                        )}
                      >
                        <item.icon className="h-8 w-8" strokeWidth={3.5} />
                      </div>
                      {!isCollapsed && (
                        <span className={cn(isActive && "text-sidebar-primary-foreground")}>
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">{item.name}</TooltipContent>}
              </Tooltip>
            );
          }
        })}
      </nav>

      <div
        className={cn(
          "mt-auto pt-4 flex items-center",
          isCollapsed ? "justify-center" : "justify-end"
        )}
      >
        <Button
          variant="default" // Usará a cor --primary do tema
          size="icon"
          onClick={onToggleCollapse}
          className={cn(
            "rounded-full",
            "border border-border shadow-md",
            isCollapsed ? "ml-0" : "ml-auto"
          )}
        >
          {isCollapsed ? <ArrowRightToLine className="h-4 w-4" /> : <ArrowLeftToLine className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;