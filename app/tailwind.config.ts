import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Mobile-first breakpoints
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      // Poppins font family
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'sans': ['Poppins', 'sans-serif'],
      },
      // Cartoony flat color palette
      colors: {
        // Primary purple theme
        primary: {
          50: '#fef7ff',
          100: '#fdeeff',
          200: '#fcdcff',
          300: '#fac2ff',
          400: '#f598ff',
          500: '#a855f7', // Main purple
          600: '#9333ea',
          700: '#7c2d92',
          800: '#6b2777',
          900: '#581c5c',
        },
        // Success green
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Main green
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Warning yellow
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Main yellow
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Danger red
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Main red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Neutral grays
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#1f2937', // Dark text
          900: '#171717',
        },
        // Background colors
        background: {
          light: '#ffffff',
          dark: '#0a0a0a',
          card: '#f8fafc',
        },
        // Text colors (these will create text-text-primary, text-text-secondary, etc.)
        'text-primary': '#1f2937',
        'text-secondary': '#6b7280', 
        'text-light': '#9ca3af',
        'text-inverse': '#ffffff',
      },
      // Animation and transition utilities
      animation: {
        'bounce-gentle': 'bounce 1s ease-in-out 2',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      },
      // Spacing for mobile-first design
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        // Touch-friendly spacing
        'touch': '44px', // Minimum touch target size
        'touch-lg': '48px', // Large touch target
      },
      // Border radius for cartoony feel
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      // Box shadows for depth
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'button': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'button-hover': '0 4px 8px rgba(0, 0, 0, 0.15)',
        // Mobile-optimized shadows
        'mobile-card': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'mobile-button': '0 1px 3px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;