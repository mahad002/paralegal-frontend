/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
        navy: {
          50: 'hsl(240 100% 98%)',
          100: 'hsl(240 100% 95%)',
          200: 'hsl(240 96% 89%)',
          300: 'hsl(240 86% 82%)',
          400: 'hsl(240 75% 72%)',
          500: 'hsl(240 67% 62%)',
          600: 'hsl(240 57% 50%)',
          700: 'hsl(240 54% 41%)',
          800: 'hsl(240 47% 32%)',
          900: 'hsl(240 39% 23%)',
          950: 'hsl(240 32% 15%)',
        },
        gold: {
          50: 'hsl(48 100% 96%)',
          100: 'hsl(48 96% 89%)',
          200: 'hsl(48 97% 77%)',
          300: 'hsl(45 97% 64%)',
          400: 'hsl(43 96% 56%)',
          500: 'hsl(37 92% 50%)',
          600: 'hsl(32 95% 44%)',
          700: 'hsl(26 90% 37%)',
          800: 'hsl(23 83% 31%)',
          900: 'hsl(22 78% 26%)',
          950: 'hsl(15 75% 15%)',
        },
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}