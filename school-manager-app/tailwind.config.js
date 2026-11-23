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
          DEFAULT: '#1e3a8a', // Dark blue for school branding
          light: '#3b82f6',
        },
        secondary: '#facc15', // Yellow for accents
      }
    },
  },
  plugins: [],
}
