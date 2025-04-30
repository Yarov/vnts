/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f9f2ff',
          100: '#f7ebfe',
          200: '#f4e5fe',
          300: '#f1defe',
          400: '#d5c9f8',
          500: '#aaa7f0',
          600: '#7977e8',
          700: '#534ae2',
          800: '#4b43cb',
          900: '#423bb5',
          950: '#3a349e',
        },
      }
    },
  },
  plugins: [],
}
