/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./packages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          red: '#b91c1c',   // Telkom Red
          dark: '#881337',  // Hover states
        },
        slate: {
          dark: '#0f172a',  // Text Main, Footer
          light: '#f8fafc', // Backgrounds
        },
        status: {
          success: '#059669',
          warning: '#d97706',
          danger: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
