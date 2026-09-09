/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: {
            50: '#fff5f7',
            100: '#fdf2f4',
            200: '#fce7ea',
            300: '#f9cbd2',
            400: '#f49eab',
            500: '#e86a82',
          },
          lavender: {
            50: '#faf7fd',
            100: '#f4edfa',
            200: '#ebdcf6',
            300: '#dec2f0',
            400: '#c59ce5',
            500: '#a872d6',
          },
        },
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
      borderRadius: {
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'subtle': '0 2px 10px -2px rgba(124, 58, 237, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        'elevated': '0 10px 25px -5px rgba(124, 58, 237, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px -3px rgba(124, 58, 237, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
