/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bfsi: {
          darkNavy: '#0D1B2A',
          deepNavy: '#142B45',
          proBlue: '#245B85',
          infoBlue: '#3478B8',
          slate: '#526477',
          muted: '#718096',
          bg: '#F4F6F8',
          card: '#FFFFFF',
          border: '#E1E6EB',
          borderLight: '#EDF2F7',
          green: '#25845A',
          greenLight: '#EBF5F0',
          amber: '#C58A27',
          amberLight: '#FEF8EC',
          red: '#C44747',
          redLight: '#FDF2F2',
          blueLight: '#EFF6FC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        dropdown: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
      }
    }
  },
  plugins: [],
};
