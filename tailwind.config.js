/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      /* Premium-sport palette: near-black + warm stone, one copper accent. Colour comes from the product photos. */
      colors: { ink: '#0A0A0A', navy: '#111111', accent: '#B4532A', glow: '#E9B99B', mist: '#F3F1EC', paper: '#FFFFFF', sun: '#B08D57' },
      /* Two typefaces only: Barlow Condensed for headlines, Inter for everything else */
      fontFamily: { display: ['"Barlow Condensed"', '"Arial Narrow"', 'Arial', 'sans-serif'], sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'] },
      /* Squarer corners everywhere (rounded-full is untouched so circles stay circles) */
      borderRadius: { DEFAULT: '2px', sm: '2px', md: '3px', lg: '4px', xl: '4px', '2xl': '6px', '3xl': '8px' },
      boxShadow: { glow: '0 10px 30px -12px rgba(10,10,10,.35)', lift: '0 18px 40px -22px rgba(10,10,10,.35)' },
    },
  },
  plugins: [],
};
