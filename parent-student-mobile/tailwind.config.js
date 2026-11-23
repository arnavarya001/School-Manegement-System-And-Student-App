/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a8a',
          light: '#3b82f6',
        },
        secondary: '#facc15',
      }
    },
  },
  plugins: [],
}
