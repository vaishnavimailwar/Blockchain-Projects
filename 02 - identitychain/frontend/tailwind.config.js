/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: '#f8f8f6',
          900: '#f1f1ee',
          850: '#ffffff',
          800: '#ececea',
          700: '#dcdcd8',
          600: '#c2c2bc',
          500: '#8f8f86',
          400: '#68685f',
        },
        ink: '#1c1c18',
        accent: {
          cyan: '#0f766e',
          blue: '#1d4ed8',
          amber: '#b45309',
          red: '#b91c1c',
          green: '#15803d',
        },
      },
      fontFamily: {
        heading: ['"Times New Roman"', 'Times', 'serif'],
        sans: ['"Times New Roman"', 'Times', 'serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(to right, rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.045) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
