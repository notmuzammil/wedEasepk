/** @type {import('tailwindcss').Config} */

/**
 * WedEase palette — "Rosewood & Gold on Ivory".
 *
 * The whole UI is themed from here. Components use the semantic Tailwind
 * names (rose = brand, stone = neutral, emerald = secondary, gold = accent),
 * so re-tuning a ramp below re-themes every screen at once.
 *
 * The same ramps are mirrored as CSS custom properties in src/index.css for
 * the handful of pages that style themselves with inline <style> blocks.
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand: deep rosewood. Richer and more jewel-toned than
        //    Tailwind's default rose, which reads candy-pink at scale.
        rose: {
          50:  '#fdf2f6',
          100: '#fce7ef',
          200: '#f9cfe0',
          300: '#f5a8c6',
          350: '#f28cb4',
          400: '#ee72a4',
          500: '#e2447f',
          600: '#d12463',
          700: '#b01a51',
          800: '#8f1743',
          900: '#78183c',
          950: '#47071f',
        },

        // ── Warm coral-pink, used alongside rose in gradients so they glow
        //    into gold rather than turning muddy violet.
        pink: {
          50:  '#fff4f2',
          100: '#ffe6e1',
          200: '#ffcbc2',
          300: '#ffa595',
          400: '#fd7d68',
          500: '#f45b46',
          600: '#df3d2e',
          700: '#bb2d21',
          800: '#9a2820',
          900: '#802721',
          950: '#460f0b',
        },

        // ── Neutrals: warm ivory / parchment instead of a cold grey.
        //    This is what makes the whole site feel like stationery
        //    rather than a dashboard.
        stone: {
          50:  '#fdfaf7',
          100: '#f8f2ec',
          150: '#f2eae0',
          200: '#eae0d4',
          250: '#ded2c4',
          300: '#cec0ae',
          // 400 and 500 are nudged darker than a smooth ramp would put them so
          // that muted labels and secondary text clear WCAG AA on white.
          400: '#a3917d',
          500: '#837262',
          600: '#6d5d4f',
          700: '#584b40',
          750: '#473c33',
          800: '#3b3229',
          850: '#2c251f',
          900: '#231d18',
          950: '#171310',
        },

        // ── Secondary: deep jewel green for the dashboards.
        emerald: {
          50:  '#f0faf5',
          100: '#dbf3e7',
          200: '#b9e7d1',
          250: '#a2ddc2',
          300: '#85d3af',
          400: '#4fba8d',
          500: '#2b9d70',
          600: '#1c7f5a',
          700: '#196549',
          800: '#14503b',
          850: '#10402f',
          900: '#113a2c',
          950: '#07211a',
        },

        // ── Accent: warm antique gold.
        gold: {
          50:  '#fdfaea',
          100: '#faf3c7',
          200: '#f5e691',
          300: '#eed353',
          400: '#e5be2b',
          500: '#d4af37',
          600: '#b8902b',
          700: '#936c22',
          800: '#7a5622',
          900: '#684721',
          950: '#3d2610',
        },
      },

      spacing: {
        4.5: '1.125rem',
      },

      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },

      // Soft, warm-tinted elevation — neutral black shadows look dirty
      // against an ivory background.
      boxShadow: {
        soft:  '0 1px 2px rgba(71, 7, 31, 0.04), 0 4px 16px rgba(71, 7, 31, 0.06)',
        lift:  '0 2px 4px rgba(71, 7, 31, 0.05), 0 12px 32px rgba(71, 7, 31, 0.10)',
        glow:  '0 8px 32px rgba(209, 36, 99, 0.22)',
      },

      // NOTE: brand gradients are deliberately NOT defined as custom
      // backgroundImage keys. A custom key that fails to load leaves an
      // element with no background at all — which on a white-text button
      // means an invisible control. Use the core utilities instead:
      //   bg-rose-600 bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800
      // The bg-rose-600 is a deliberate fallback fill behind the gradient.
    },
  },
  plugins: [],
}
