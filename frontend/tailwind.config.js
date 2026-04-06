/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        ink: {
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        lime: {
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
        }
      },
      fontFamily: {
        sans:    ['Satoshi', 'Inter', 'sans-serif'],
        display: ['Cabinet Grotesk', 'Outfit', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '4xl': '32px',
      },
      boxShadow: {
        'glow-orange': '0 0 40px rgba(249,115,22,0.15)',
        'glow-lime':   '0 0 40px rgba(132,204,22,0.2)',
        'card':        '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        'lifted':      '0 12px 40px rgba(0,0,0,0.1)',
      }
    },
  },
  plugins: [],
}