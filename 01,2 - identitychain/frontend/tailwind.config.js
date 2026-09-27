/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: '#0a0c0f',
          900: '#0f1216',
          850: '#12161b',
          800: '#171c22',
          700: '#1e242c',
          600: '#2a323c',
          500: '#3a4450',
          400: '#5b6675',
        },
        accent: {
          cyan: '#3fd0c9',
          blue: '#4d8dff',
          amber: '#e8a23d',
          red: '#e2495a',
          green: '#4dc98a',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
