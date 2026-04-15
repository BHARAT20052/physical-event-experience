/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app.html",
    "./dashboard.html",
    "./signage.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bharat: {
          saffron: '#FF9933',
          white: '#FFFFFF',
          green: '#138808',
          blue: '#000080',
        }
      }
    },
  },
  plugins: [],
}
