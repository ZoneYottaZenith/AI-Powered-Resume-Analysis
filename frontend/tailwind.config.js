/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cosmos: {
          50: '#f0f1fe',
          100: '#dde0fc',
          200: '#c3c7fa',
          300: '#9ba2f6',
          400: '#6d72f0',
          500: '#4a4de8',
          600: '#3a35dc',
          700: '#3129c4',
          800: '#2b249f',
          900: '#28237e',
          950: '#0e0d33',
        },
        nebula: {
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
        },
        stellar: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
      },
      fontFamily: {
        display: ['"Clash Display"', '"SF Pro Display"', 'system-ui', 'sans-serif'],
        body: ['"General Sans"', '"SF Pro Text"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(74, 77, 232, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(74, 77, 232, 0.6)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
