/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        apple: {
          red: '#FA233B',
          pink: '#FF2D55',
          dark: '#000000',
          card: '#1C1C1E',
          surface: '#2C2C2E',
          tertiary: '#3A3A3C',
          subtext: '#8E8E93',
          border: 'rgba(255, 255, 255, 0.08)',
          glass: 'rgba(28, 28, 30, 0.75)',
        }
      },
      fontFamily: {
        sf: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Roboto', 'sans-serif'],
        rounded: ['"SF Pro Rounded"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'apple-card': '0 8px 24px rgba(0, 0, 0, 0.4)',
        'apple-glow': '0 12px 36px rgba(250, 35, 59, 0.35)',
        'apple-float': '0 16px 40px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'morph-mesh': 'morphMesh 12s ease-in-out infinite alternate',
      },
      keyframes: {
        morphMesh: {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.2) rotate(180deg)' },
          '100%': { transform: 'scale(1.05) rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
