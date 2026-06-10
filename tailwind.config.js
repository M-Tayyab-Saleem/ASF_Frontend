/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C97A',
          dark: '#9A7A2E',
          muted: '#6B5520',
        },
        surface: {
          1: '#111111',
          2: '#1A1A1A',
          3: '#222222',
        },
        border: {
          DEFAULT: '#2A2A2A',
          gold: '#9A7A2E',
        },
        text: {
          primary: '#F5F0E8',
          secondary: '#A09880',
          muted: '#5A5040',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        // No gradients — intentionally empty
      },
    },
  },
  plugins: [],
};
