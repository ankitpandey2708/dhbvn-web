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
      // Premium Typography Scale with letter-spacing
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],  // 12px - Labels
        sm: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }], // 14px - Secondary
        base: ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],        // 16px - Body
        lg: ['1.125rem', { lineHeight: '1.5', letterSpacing: '0' }],      // 18px - Lead text
        xl: ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }], // 20px - Small headings
        '2xl': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }], // 24px - Headings
        '3xl': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],   // 32px - Large headings
        '4xl': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }], // 40px - Hero
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],   // 48px - Display
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
        'icon-sm': '1rem',      // 16px
        'icon-md': '1.25rem',   // 20px
        'icon-lg': '1.5rem',    // 24px
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
      // Premium Color System (Indigo-based)
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Premium indigo primary
        primary: {
          50: "hsl(var(--primary-50))",
          100: "hsl(var(--primary-100))",
          200: "hsl(var(--primary-200))",
          300: "hsl(var(--primary-300))",
          400: "hsl(var(--primary-400))",
          500: "hsl(var(--primary-500))",
          600: "hsl(var(--primary-600))",
          700: "hsl(var(--primary-700))",
          800: "hsl(var(--primary-800))",
          900: "hsl(var(--primary-900))",
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Sophisticated neutrals
        neutral: {
          0: "hsl(var(--neutral-0))",
          50: "hsl(var(--neutral-50))",
          100: "hsl(var(--neutral-100))",
          200: "hsl(var(--neutral-200))",
          300: "hsl(var(--neutral-300))",
          400: "hsl(var(--neutral-400))",
          500: "hsl(var(--neutral-500))",
          600: "hsl(var(--neutral-600))",
          700: "hsl(var(--neutral-700))",
          800: "hsl(var(--neutral-800))",
          900: "hsl(var(--neutral-900))",
          950: "hsl(var(--neutral-950))",
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
          500: "hsl(var(--accent-500))",
          600: "hsl(var(--accent-600))",
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          50: "hsl(var(--success-50))",
          500: "hsl(var(--success-500))",
          600: "hsl(var(--success-600))",
        },
        error: {
          50: "hsl(var(--error-50))",
          500: "hsl(var(--error-500))",
          600: "hsl(var(--error-600))",
        },
        warning: {
          50: "hsl(var(--warning-50))",
          500: "hsl(var(--warning-500))",
          600: "hsl(var(--warning-600))",
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
      // Premium Border Radius
      borderRadius: {
        sm: '0.375rem',  // 6px
        DEFAULT: '0.5rem', // 8px
        lg: '0.75rem',   // 12px
        xl: '1rem',      // 16px
        '2xl': '1.5rem', // 24px
      },
      // Premium Shadow System (Layered)
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        primary: '0 8px 16px -4px rgba(99, 102, 241, 0.2), 0 4px 8px -2px rgba(99, 102, 241, 0.1)',
        none: 'none',
      },
      // Premium Transitions
      transitionDuration: {
        75: '75ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
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
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        "fade-in": {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 