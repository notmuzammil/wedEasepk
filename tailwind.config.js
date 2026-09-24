import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // WedEase primary — a refined berry-rose. Overrides Tailwind's `rose`
        // so every existing rose-* utility picks up the brand palette.
        rose: {
          50: '#fdf4f6',
          100: '#fbe8ed',
          200: '#f6d0da',
          300: '#eeaabb',
          400: '#e27b95',
          500: '#d14f72',
          600: '#b8345a',
          700: '#9a2749',
          800: '#80233f',
          900: '#6c2139',
          950: '#3d0d1c',
        },
        emerald: {
          50: '#f2faf7',
          100: '#e2f4ed',
          200: '#c9e8dc',
          300: '#a2d6c3',
          400: '#73bba2',
          500: '#4fa085',
          600: '#3c816b',
          700: '#326857',
          800: '#0F4C3A',
          900: '#224037',
          950: '#0f2420',
        },
        gold: {
          50: '#fcf9ef',
          100: '#f8f0d8',
          200: '#f0dfae',
          300: '#e6c97d',
          400: '#dcb456',
          500: '#c99a3a',
          600: '#ad7c2e',
          700: '#8c5f28',
          800: '#744d27',
          900: '#624124',
          950: '#372111',
        },
        stone: {
          250: '#e0dbd6',
          750: '#3a3431',
          850: '#231f1d',
        },
        ivory: '#fbf8f4',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'Cambria', 'serif'],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(28, 25, 23, 0.04), 0 4px 16px -4px rgba(28, 25, 23, 0.08)',
        lift: '0 2px 4px rgba(28, 25, 23, 0.04), 0 18px 40px -12px rgba(28, 25, 23, 0.18)',
        glow: '0 10px 30px -10px rgba(184, 52, 90, 0.55)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        indeterminate: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(200%)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        marquee: 'marquee 40s linear infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
        indeterminate: 'indeterminate 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [animate],
}
