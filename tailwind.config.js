/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "rgba(0, 242, 254, 0.4)",
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
          purple: "#8b5cf6",
          cyan: "#00f2fe",
          emerald: "#10b981",
          pink: "#ff007a",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#00f2fe',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          purple: '#8b5cf6',
          violet: '#7928ca',
          dark: '#07090e',
          surface: '#0d111a',
          surfaceHover: '#151b28',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "scanline": {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
        "scanline": "scanline 2s linear infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      boxShadow: {
        "neon-cyan": "0 0 20px -3px rgba(0, 242, 254, 0.5), 0 0 10px -2px rgba(0, 242, 254, 0.3)",
        "neon-purple": "0 0 20px -3px rgba(139, 92, 246, 0.5), 0 0 10px -2px rgba(139, 92, 246, 0.3)",
        "neon-emerald": "0 0 20px -3px rgba(16, 185, 129, 0.5), 0 0 10px -2px rgba(16, 185, 129, 0.3)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "card-glow": "0 0 0 1px rgba(255, 255, 255, 0.08), 0 12px 36px -8px rgba(0, 0, 0, 0.6)",
      }
    },
  },
  plugins: [],
}
