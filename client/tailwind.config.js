/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EFFBF3',
          100: '#D7F4E1',
          200: '#B0E8C5',
          300: '#7DD6A2',
          400: '#45BE7B',
          500: '#1EA65C',
          600: '#12904D',
          700: '#0F7340',
          800: '#0E5A34',
          900: '#0B3D24',
          950: '#062818',
        },
        deep: {
          DEFAULT: '#0A3A28',
          light: '#125C3A',
          dark: '#052018',
        },
        sun: {
          100: '#FEF7D6',
          200: '#FCEFA8',
          300: '#F9E36B',
          400: '#F5D547',
          500: '#EFC42B',
        },
        blush: '#FDE4DC',
        lav: '#E5E6FB',
        ink: {
          DEFAULT: '#12211B',
          muted: '#6B7C74',
          soft: '#9AA8A1',
        },
        canvas: '#F4F7F5',
        line: '#E6ECE8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,40,29,0.04), 0 8px 24px -12px rgba(16,40,29,0.12)',
        soft: '0 2px 8px rgba(16,40,29,0.06)',
        lift: '0 18px 40px -18px rgba(16,40,29,0.28)',
      },
      borderRadius: {
        xl2: '1.25rem',
        '4xl': '2rem',
      },
      backgroundImage: {
        'deep-green': 'radial-gradient(120% 90% at 20% 25%, #1B7B4C 0%, #0E5231 42%, #073522 72%, #04241a 100%)',
      },
      keyframes: {
        floaty: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        floaty: 'floaty 5s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
