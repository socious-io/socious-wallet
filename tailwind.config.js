/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        primary: '#004A46',
        secondary: '#344054',
        success: '#079455',
        brand: {
          secondary: '#003B38',
          utility: {
            50: '#F3F6F6',
            200: '#CCDBDA',
          },
        },
        black: {
          400: '#85888E',
          500: '#61646C',
          600: '#475467',
          700: '#1F242F',
          800: '#101828',
        },
        white: {
          50: '#EAECF0',
          100: '#D0D5DD',
          200: '#94969C',
          300: '#98A2B3',
        },
      },
    },
  },
  plugins: [],
};
