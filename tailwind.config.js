/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00B097',
          hover: '#009A84',
          light: '#E6F7F5',
          dark: '#007A6A',
        },
        secondary: {
          DEFAULT: '#D3BDF2',
          light: '#F2ECFD',
          dark: '#A98FD4',
        },
        surface: {
          1: '#F8F9FA',
          2: '#F1F3F5',
          dark: '#0D0D0D',
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E0',
          primary: '#00B097',
        },
        text: {
          primary: '#0D0D0D',
          secondary: '#4A5568',
          muted: '#9AA3AF',
          onDark: '#FFFFFF',
          onPrimary: '#FFFFFF',
        },
        status: {
          implemented: '#10B981',
          implementedBg: '#D1FAE5',
          notImplemented: '#EF4444',
          notImplementedBg: '#FEE2E2',
          pending: '#F59E0B',
          pendingBg: '#FEF3C7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};
