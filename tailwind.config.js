/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'blue': '#45cfe3',
        'red': '#e46826',
        'yellow': '#f3d34a',
        'green': '#71e152',
        'dark-green': '#74DF56',
      },
    },
  },
  plugins: [],
}

