import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme"; // Importar defaultTheme

export default {
  darkMode: ["class"], // Habilitado para que o Tailwind possa aplicar os temas de cor dinamicamente
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: defaultTheme.fontFamily.sans, // Revertido para a fonte sans-serif padrão
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
          // Novas cores para os itens do sidebar
          "item-bg-1": "hsl(var(--sidebar-item-bg-1))",
          "item-bg-2": "hsl(var(--sidebar-item-bg-2))",
          "item-bg-3": "hsl(var(--sidebar-item-bg-3))",
          "item-bg-4": "hsl(var(--sidebar-item-bg-4))",
          "item-bg-5": "hsl(var(--sidebar-item-bg-5))",
          "item-bg-6": "hsl(var(--sidebar-item-bg-6))",
          "item-bg-7": "hsl(var(--sidebar-item-bg-7))",
          "item-bg-8": "hsl(var(--sidebar-item-bg-8))",
          "item-bg-9": "hsl(var(--sidebar-item-bg-9))",
        },
        landingPage: { // NOVO: Cores específicas para a Landing Page
          "lp-verde-bambu": "hsl(var(--lp-verde-bambu))",
          "lp-verde-folha-seca": "hsl(var(--lp-verde-folha-seca))",
          "lp-creme-terra": "hsl(var(--lp-creme-terra))",
          "lp-marrom-avela": "hsl(var(--lp-marrom-avela))",
          "lp-bege-areia": "hsl(var(--lp-bege-areia))",
        },
        // NOVO: Adicionado para o tema Nature Vet
        "primary-unselected": {
          DEFAULT: "hsl(var(--primary-unselected))",
          foreground: "hsl(var(--primary-unselected-foreground))",
        },
        // NOVO: Cores para os cards do Dashboard
        "dashboard-card": {
          "1": "hsl(var(--dashboard-card-1))",
          "2": "hsl(var(--dashboard-card-2))",
          "3": "hsl(var(--dashboard-card-3))",
          "4": "hsl(var(--dashboard-card-4))",
          "5": "hsl(var(--dashboard-card-5))",
          "6": "hsl(var(--dashboard-card-6))",
          "7": "hsl(var(--dashboard-card-7))",
          "8": "hsl(var(--dashboard-card-8))",
          "9": "hsl(var(--dashboard-card-9))",
          "10": "hsl(var(--dashboard-card-10))",
          "11": "hsl(var(--dashboard-card-11))",
          "12": "hsl(var(--dashboard-card-12))",
        },
        // NOVO: Cores para os cards de status de consultas
        "appointments-status": {
          "waiting-bg": "hsl(var(--appointments-status-waiting-bg))",
          "waiting-fg": "hsl(var(--appointments-status-waiting-fg))",
          "in-progress-bg": "hsl(var(--appointments-status-in-progress-bg))",
          "in-progress-fg": "hsl(var(--appointments-status-in-progress-fg))",
          "completed-bg": "hsl(var(--appointments-status-completed-bg))",
          "completed-fg": "hsl(var(--appointments-status-completed-fg))",
          "cancelled-bg": "hsl(var(--appointments-status-cancelled-bg))",
          "cancelled-fg": "hsl(var(--appointments-status-cancelled-fg))",
        },
        // NOVO: Cores para os badges de risco de internação
        "risk": {
          "no-risk-bg": "hsl(var(--risk-no-risk-bg))",
          "low-bg": "hsl(var(--risk-low-bg))",
          "medium-bg": "hsl(var(--risk-medium-bg))",
          "high-bg": "hsl(var(--risk-high-bg))",
          "emergency-bg": "hsl(var(--risk-emergency-bg))",
        },
        // NOVO: Cores para os badges de status de internação
        "internment-status": {
          "observacao-bg": "hsl(var(--internment-status-observacao-bg))",
          "estavel-bg": "hsl(var(--internment-status-estavel-bg))",
          "critico-bg": "hsl(var(--internment-status-critico-bg))",
          "alta-bg": "hsl(var(--internment-status-alta-bg))",
          "obito-bg": "hsl(var(--internment-status-obito-bg))",
        },
        // NOVO: Cores para os badges de plano
        "plan-badge": {
          "basic-bg": "hsl(var(--plan-badge-basic-bg))",
          "premium-bg": "hsl(var(--plan-badge-premium-bg))",
          "enterprise-bg": "hsl(var(--plan-badge-enterprise-bg))",
        },
        // NOVO: Cor dourada para o botão do plano
        golden: {
          DEFAULT: "hsl(var(--golden-button))",
          foreground: "hsl(var(--golden-button-foreground))",
        },
      },
      borderRadius: {
        lg: "0.75rem", // Aumentado de var(--radius)
        md: "calc(0.75rem - 2px)", // Baseado no novo lg
        sm: "calc(0.75rem - 4px)", // Baseado no novo lg
        xl: "1rem", // Novo tamanho
        "2xl": "1.5rem", // Novo tamanho
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        "fade-in-down": {
          from: {
            opacity: "0",
            transform: "translateY(-20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in-up": {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        blob: "blob 7s infinite cubic-bezier(0.6, 0.01, 0.3, 0.9)",
        "fade-in-down": "fade-in-down 1s ease-out forwards",
        "fade-in-up": "fade-in-up 1s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;