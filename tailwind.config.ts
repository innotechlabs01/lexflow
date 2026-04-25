import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Stitch Design System (#004ac6)
        primary: {
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#0066ff',
          600: '#004ac6',
          700: '#003999',
          800: '#002766',
          900: '#001433',
          DEFAULT: '#004ac6',
          foreground: '#ffffff',
        },
        // Secondary - Stitch (#0058be)
        secondary: {
          50: '#e6f2ff',
          100: '#cce6ff',
          200: '#99ccff',
          300: '#66b3ff',
          400: '#3399ff',
          500: '#0080ff',
          600: '#0058be',
          700: '#00428e',
          800: '#002c5f',
          900: '#00162f',
          DEFAULT: '#0058be',
          foreground: '#ffffff',
        },
        // Tertiary - Stitch (#3e3fcc)
        tertiary: {
          50: '#eceefb',
          100: '#d9ddf7',
          200: '#b3bbf0',
          300: '#8d98e8',
          400: '#6676e1',
          500: '#3e3fcc',
          600: '#2d2fa3',
          700: '#1f2279',
          800: '#121650',
          900: '#080b28',
          DEFAULT: '#3e3fcc',
          foreground: '#ffffff',
        },
        // Gray (Neutro Profesional)
        gray: {
          50: '#f9f9ff',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Success (Verde)
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#047857',
          DEFAULT: '#10b981',
          foreground: '#ffffff',
        },
        // Warning (Amarillo)
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#f59e0b',
          foreground: '#000000',
        },
        // Danger (Rojo)
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        // Info (Azul claro)
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
        // Sidebar - LexFlow SPEC
        sidebar: {
          bg: '#1f2937',
          hover: '#374151',
          active: '#2563eb',
          text: '#f9fafb',
          muted: '#9ca3af',
          border: '#374151',
        },
        // Timeline event colors
        timeline: {
          document: '#3b82f6',
          hearing: '#f59e0b',
          communication: '#10b981',
          status: '#8b5cf6',
          note: '#6b7280',
          task: '#ec4899',
          external: '#06b6d4',
        },
        // Background - Stitch (#f9f9ff)
        background: '#f9f9ff',
        foreground: '#111827',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config