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
        // Tricorn Black - SW 6258
        tricorn: {
          50: 'hsl(0 0% 95%)',
          100: 'hsl(0 0% 90%)',
          200: 'hsl(0 0% 80%)',
          300: 'hsl(0 0% 70%)',
          400: 'hsl(0 0% 60%)',
          500: 'hsl(0 0% 50%)',
          600: 'hsl(0 0% 40%)',
          700: 'hsl(0 0% 30%)',
          800: 'hsl(0 0% 20%)',
          900: 'hsl(0 0% 15%)',
          950: 'hsl(0 0% 10%)',
        },
        // Sconce Gold - SW 6398
        sconce: {
          50: 'hsl(32 100% 95%)',
          100: 'hsl(32 100% 90%)',
          200: 'hsl(32 100% 80%)',
          300: 'hsl(32 100% 70%)',
          400: 'hsl(32 100% 60%)',
          500: 'hsl(32 95% 50%)',
          600: 'hsl(32 95% 44%)',
          700: 'hsl(32 90% 38%)',
          800: 'hsl(32 85% 32%)',
          900: 'hsl(32 80% 26%)',
          950: 'hsl(32 75% 20%)',
        },
        // In The Navy - SW 9178
        navy: {
          50: 'hsl(210 100% 95%)',
          100: 'hsl(210 100% 90%)',
          200: 'hsl(210 100% 80%)',
          300: 'hsl(210 100% 70%)',
          400: 'hsl(210 100% 60%)',
          500: 'hsl(210 100% 50%)',
          600: 'hsl(210 100% 40%)',
          700: 'hsl(210 100% 30%)',
          800: 'hsl(210 100% 25%)',
          900: 'hsl(210 100% 20%)',
          950: 'hsl(210 100% 15%)',
        },
        // Essential Gray - SW 6002
        gray: {
          50: 'hsl(0 0% 98%)',
          100: 'hsl(0 0% 95%)',
          200: 'hsl(0 0% 90%)',
          300: 'hsl(0 0% 80%)',
          400: 'hsl(0 0% 70%)',
          500: 'hsl(0 0% 60%)',
          600: 'hsl(0 0% 50%)',
          700: 'hsl(0 0% 40%)',
          800: 'hsl(0 0% 30%)',
          900: 'hsl(0 0% 20%)',
          950: 'hsl(0 0% 15%)',
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