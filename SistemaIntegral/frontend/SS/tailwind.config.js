/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          guinda: {
            DEFAULT: '#800020', // Color guinda principal
            dark: '#600018',    // Más oscuro
            light: '#9a0026',   // Más claro
          }
        }
      },
    },
    plugins: [],
  }