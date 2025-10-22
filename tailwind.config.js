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
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],      // 12px
        sm: ['0.875rem', { lineHeight: '1.5' }],     // 14px
        base: ['1rem', { lineHeight: '1.5' }],       // 16px
        lg: ['1.125rem', { lineHeight: '1.5' }],     // 18px
        xl: ['1.25rem', { lineHeight: '1.4' }],      // 20px
        '2xl': ['1.5rem', { lineHeight: '1.4' }],    // 24px
        '3xl': ['1.875rem', { lineHeight: '1.3' }],  // 30px
        '4xl': ['2.25rem', { lineHeight: '1.2' }],   // 36px
      },
      spacing: {
        'card-sm': '0.75rem',   // 12px
        'card': '1rem',         // 16px
        'card-lg': '1.5rem',    // 24px
      },
      width: {
        'input-sm': '10rem',    // 160px
        'input-md': '18rem',    // 288px
        'input-lg': '24rem',    // 384px
        'col-sm': '9.375rem',   // 150px
        'col-md': '12.5rem',    // 200px
        'col-lg': '18.75rem',   // 300px
      },
      minWidth: {
        'col-sm': '9.375rem',   // 150px
        'col-md': '12.5rem',    // 200px
        'col-lg': '18.75rem',   // 300px
      },
      maxWidth: {
        'prose': '65ch',        // 45-75 character limit
      },
      height: {
        'icon-sm': '1rem',      // 16px
        'icon-md': '1.25rem',   // 20px
        'icon-lg': '1.5rem',    // 24px
      },
      width: {
        'icon-sm': '1rem',      // 16px
        'icon-md': '1.25rem',   // 20px
        'icon-lg': '1.5rem',    // 24px
        'input-sm': '10rem',    // 160px
        'input-md': '18rem',    // 288px
        'input-lg': '24rem',    // 384px
        'col-sm': '9.375rem',   // 150px
        'col-md': '12.5rem',    // 200px
        'col-lg': '18.75rem',   // 300px
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
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 