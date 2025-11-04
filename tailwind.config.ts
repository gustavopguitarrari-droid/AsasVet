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
        // Adicionando a cor verde para o badge de sucesso
        green: {
          500: "hsl(142.1 76.2% 36.3%)", // Um tom de verde para o modo claro
        },
        // Novas cores para os botões de seleção de tema
        purple: {
          600: "hsl(262.1 83.3% 57.8%)",
        },
        orange: {
          500: "hsl(28.1 91.2% 50.6%)",
        },
        teal: {
          500: "hsl(177.1 70% 35%)",
        },
        pink: { // Nova cor: Pink
          500: "hsl(330 80% 70%)",
        },
        amber: { // Usado para o tema 'brown'
          800: "hsl(30 40% 30%)",
        },
        // Novas cores para os níveis de risco
        blue: {
          500: "hsl(220 80% 60%)", // Para risco 'Sem risco'
        },
        yellow: {
          500: "hsl(45 93% 47.1%)", // Para risco 'Médio'
        },
        red: {
          500: "hsl(0 84.2% 60.2%)", // Para risco 'Emergência' (vermelho vivo)
          700: "hsl(0 84.2% 40%)", // Para risco 'Emergência' (vermelho mais escuro, se necessário)
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;