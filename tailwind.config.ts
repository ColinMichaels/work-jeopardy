import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['"Segoe UI"', '"Trebuchet MS"', 'sans-serif'],
        display: ['"Avenir Next"', '"Trebuchet MS"', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        board: '0 24px 80px rgba(2, 6, 23, 0.4)',
      },
    },
  },
  plugins: [],
} satisfies Config;
