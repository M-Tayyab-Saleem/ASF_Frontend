/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00B097', // Teal
          hover: '#009681',
          light: '#E6F7F5',
          dark: '#007A68',
        },
        secondary: {
          DEFAULT: '#D3BDF2',
          light: '#F2ECFD',
          dark: '#A98FD4',
        },
        surface: {
          1: '#FFFFFF',
          2: '#F8FAFC', // Slate 50
          dark: '#0D0D0D',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.4)', // Glassmorphism border
          strong: 'rgba(255, 255, 255, 0.6)',
          primary: '#00B097',
        },
        text: {
          primary: '#0D1514', // Deep Teal-Black
          secondary: '#334155', // Slate 700
          muted: '#64748B', // Slate 500
          onDark: '#FFFFFF',
          onPrimary: '#FFFFFF',
        },
        status: {
          implemented: '#00B097',
          implementedBg: '#E6F7F5',
          notImplemented: '#EF4444',
          notImplementedBg: '#FEE2E2',
          pending: '#F59E0B',
          pendingBg: '#FEF3C7',
        }
      },
      fontFamily: {
        sans: ['Rothek', '"Avenir Next"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"'],
        mono: ['Courier New', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 176, 151, 0.05)',
        'glass-hover': '0 12px 40px 0 rgba(0, 176, 151, 0.1)',
      }
    },
  },
  plugins: [],
};
