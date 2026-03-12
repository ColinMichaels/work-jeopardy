import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-ui)'],
        display: ['var(--font-display)'],
        board: ['var(--font-board)'],
      },
      boxShadow: {
        board: '0 24px 80px rgba(2, 6, 23, 0.4)',
      },
    },
  },
  plugins: [],
} satisfies Config;
