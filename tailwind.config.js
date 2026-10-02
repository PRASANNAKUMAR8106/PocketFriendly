/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FBF8F5',
          100: '#F5ECE3',
          200: '#ECD8C5',
          300: '#DDBFA2',
          400: '#C99E75',
          500: '#B07D4C',
          600: '#8E5A2F',
          700: '#724121',
          800: '#5A321A',
          900: '#3D2111',
          950: '#231108',
        },
        maroon: {
          50: '#FDF2F4',
          100: '#FCE7EB',
          200: '#F8D0D8',
          300: '#F1A9B8',
          400: '#E4748D',
          500: '#D24467',
          600: '#BA2B50',
          700: '#9B1D3D',
          800: '#800020', // Regal Indian Maroon
          900: '#641225',
          950: '#3B0512',
        },
        gold: {
          50: '#FBF9EF',
          100: '#F5F0D6',
          200: '#EBE0AC',
          300: '#DDCC7D',
          400: '#CDB44F',
          500: '#C5A059', // Regal Champagne Gold
          600: '#A98236',
          700: '#856228',
          800: '#6A4D23',
          900: '#583F20',
          950: '#31210D',
        },
        ivory: {
          DEFAULT: '#FAF8F5',
          dark: '#F3EFEA',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(128, 0, 32, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 35px -10px rgba(128, 0, 32, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
