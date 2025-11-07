import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme"; // Importar defaultTheme

export default {
  darkMode: ["class"],
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
        // Cores para os novos temas
        orange: {
          500: "hsl(28 85% 55%)", // Laranja Pôr do Sol
        },
        blue: {
          500: "hsl(210 80% 45%)", // Azul Oceano
        },
        green: {
          500: "hsl(160 70% 35%)", // Verde Esmeralda
          400: "hsl(120 80% 40%)", // Verde Vivo
        },
        purple: {
          600: "hsl(270 60% 45%)", // Púrpura Real
        },
        pink: {
          500: "hsl(330 80% 65%)", // Rosa Chiclete
        },
        yellow: {
          500: "hsl(45 90% 55%)", // Amarelo Dourado
        },
        red: {
          500: "hsl(0 80% 45%)", // Vermelho Rubi
        },
        "teal-blue": { // NOVO: Azul-Esverdeado Principal
          500: "hsl(188 39% 38%)",
        },
        // Nova paleta de cores para o tema Nature Vet
        "verde-bambu": {
          DEFAULT: "hsl(80 40% 76%)", // #C5E1A5
          darker: "hsl(80 30% 20%)", // Dark mode equivalent
        },
        "verde-folha-seca": {
          DEFAULT: "hsl(80 40% 70%)", // #AED581
          darker: "hsl(80 40% 60%)", // For gradients
          lighter: "hsl(80 50% 60%)", // Dark mode equivalent
        },
        "creme-terra": {
          DEFAULT: "hsl(50 100% 99%)", // #FFFDE7
          darker: "hsl(30 10% 15%)", // Dark mode equivalent
        },
        "marrom-avela": {
          DEFAULT: "hsl(20 18% 47%)", // #8D6E63
          lighter: "hsl(30 10% 90%)", // Dark mode equivalent
        },
        "bege-areia": {
          DEFAULT: "hsl(40 100% 85%)", // #FFECB3
          darker: "hsl(40 50% 30%)", // Dark mode equivalent
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