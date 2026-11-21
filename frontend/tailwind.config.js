/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#0a192f', 800: '#112240', 700: '#233554' },
        brand: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
      },
      animation: {
        'bounce-slow': 'bounce 1.5s infinite',
      }
    }
  },
  plugins: [],
};
