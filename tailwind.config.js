/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        mazenod: {
          blue: '#23447C',
          sky: '#77A8D8',
          green: '#2D8F48',
          red: '#C83E2E',
          gold: '#F2A23A',
        },
      },
      fontFamily: {
        brand: ['"HouschkaPro-Medium"', 'ui-sans-serif', 'system-ui'],
        brandRound: ['"HouschkaRounded-Bold"', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
