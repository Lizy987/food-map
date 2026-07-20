/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#E86B35',
        secondary: '#2D2D2D',
        bg: '#FAFAFA',
        card: '#FFFFFF',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
};
