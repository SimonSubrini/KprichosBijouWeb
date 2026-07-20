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
          pink: '#ffd1dc', // Pastel pink from the logo background
          purple: '#d8b4e2', // Pastel purple
          magenta: '#c9184a', // Vibrant magenta for text/accents
          light: '#fdf0f3', // Very light background
          dark: '#590d22', // Dark text
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
