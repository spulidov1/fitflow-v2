/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#d6e0fd',
          300: '#b3c5fb',
          400: '#8da5f8',
          500: '#667eea',
          600: '#5568d3',
          700: '#4553b8',
          800: '#394395',
          900: '#2f3775',
        },
        secondary: {
          500: '#764ba2',
          600: '#653d8f',
          700: '#55327b',
        },
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      },
    },
  },
  plugins: [],
}
