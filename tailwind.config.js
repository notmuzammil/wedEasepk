/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#f2faf7',
          100: '#e2f4ed',
          200: '#c9e8dc',
          300: '#a2d6c3',
          400: '#73bba2',
          500: '#4fa085',
          600: '#3c816b',
          700: '#326857',
          800: '#0F4C3A',
          900: '#224037',
          950: '#0f2420',
        },
        gold: {
          50: '#fdfbe9',
          100: '#fbf7c5',
          200: '#f7ed8e',
          300: '#f1db4d',
          400: '#eac620',
          500: '#D4AF37',
          600: '#b88d27',
          700: '#93691e',
          800: '#77521c',
          900: '#64441c',
          950: '#3a240c',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
