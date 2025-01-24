/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // 👈 Esta línea es la que necesitas agregar
  theme: {
    extend: {
      // Aquí podrías agregar extensiones personalizadas si necesitas
    },
  },
  plugins: [],
};