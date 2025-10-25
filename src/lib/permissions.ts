import {
  LayoutDashboard, Users, PawPrint, CalendarDays, ClipboardList, DollarSign,
  Plus, Stethoscope, ReceiptText, Package, Settings, UserCircle,
} from "lucide-react"; // Importar ícones

export const ROLES = {
  ADMINISTRATOR: "Administrador",
  MANAGER: "Gerente",
  VETERINARIAN: "Veterinário",
  NURSE: "Enfermeiro",
  RECEPTIONIST: "Recepcionista",
  INTERN: "Estagiário",
  OTHER: "Outro",
};

export interface NavItemConfig {
  name: string;
  icon: React.ElementType;
  path: string;
  allowedRoles: string[];
}

// Define todos os itens de navegação e suas permissões
export const navItemConfigs: NavItemConfig[] = [
  {
    name: "Painel",
    icon: LayoutDashboard,
    path: "/painel",
    allowedRoles: [ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.VETERINARIAN, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.INTERN, ROLES.OTHER],
  },
  {
    name: "Consultas",
    icon: ClipboardList,
    path: "/consultas",
    allowedRoles: [ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.VETERINARIAN, ROLES.RECEPTIONIST],
  },
  {
    name: "Internação",
    icon: Plus, // Mantendo o ícone 'Plus' como no código existente
    path: "/internacao",
    allowedRoles: [ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.VETERINARIAN, ROLES.NURSE],
  },
  {
    name: "Cadastro",
    icon: PawPrint,
    path: "/cadastro",
    allowedRoles: [ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.VETERINARIAN, ROLES.RECEPTIONIST],
  },
  {
    name: "Agenda",
    icon: CalendarDays,
    path: "/medical-records",
    allowedRoles: [ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.VETERINARIAN, ROLES.RECEPTIONIST],
  },
  {
    name: "Equipe",
    icon: Stethoscope,
    path: "/veterinarios",
    allowedRoles: [ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.VETERINARIAN, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.INTERN],
  },
  {
    name: "Estoque",
    icon: Package,
    path: "/estoque",
    allowedRoles: [ROLES.ADMINISTRATOR, ROLES.MANAGER],
  },
  {
    name: "Caixa",
    icon: ReceiptText,
    path: "/caixa",
    allowedRoles: [ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.RECEPTIONIST],
  },
  {
    name: "Financeiro",
    icon: DollarSign,
    path: "/financeiro",
    allowedRoles: [ROLES.ADMINISTRATOR, ROLES.MANAGER],
  },
  {
    name: "Perfil",
    icon: UserCircle,
    path: "/profile",
    allowedRoles: [ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.VETERINARIAN, ROLES.NURSE, ROLES.RECEPTIONIST, ROLES.INTERN, ROLES.OTHER],
  },
  {
    name: "Configurações",
    icon: Settings,
    path: "/settings",
    allowedRoles: [ROLES.ADMINISTRATOR],
  },
];

// Função auxiliar para verificar se um usuário tem acesso a um determinado caminho
export const hasAccess = (userRole: string | undefined, path: string): boolean => {
  if (!userRole) return false; // Sem cargo, sem acesso a rotas protegidas

  // Rotas públicas que não exigem nenhum cargo específico (mas podem exigir autenticação para '/')
  if (path === "/" || path === "/login" || path === "/404") {
    return true;
  }

  const route = navItemConfigs.find(rp => rp.path === path);

  if (!route) {
    // Se uma rota não for explicitamente definida em navItemConfigs, ela é implicitamente protegida
    // e acessível apenas pelo Administrador. Este é um padrão rigoroso.
    return userRole === ROLES.ADMINISTRATOR;
  }

  return route.allowedRoles.includes(userRole);
};