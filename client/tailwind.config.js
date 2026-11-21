/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50:'#f0f4ff', 100:'#dbe4ff', 200:'#bac8ff', 300:'#91a7ff', 400:'#748ffc', 500:'#4c6ef5', 600:'#4263eb', 700:'#3b5bdb', 800:'#364fc7', 900:'#2f44ad', DEFAULT:'#1a2a6c' },
        teal: { 50:'#e6fcf5', 100:'#c3fae8', 200:'#96f2d7', 300:'#63e6be', 400:'#38d9a9', 500:'#20c997', 600:'#12b886', 700:'#0ca678', 800:'#099268', 900:'#087f5b', DEFAULT:'#0ca678' }
      }
    }
  },
  plugins: []
}
