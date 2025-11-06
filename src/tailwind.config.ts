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
        // Cores para o novo tema 'Moderno'
        "green-mint": {
          500: "hsl(168 70% 83%)",
        },
        "peach-soft": {
          500: "hsl(30 100% 86%)",
        },
        "pale-lavender": {
          500: "hsl(240 100% 94%)",
        },
        "dark-navy-blue": {
          500: "hsl(180 25% 25%)",
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