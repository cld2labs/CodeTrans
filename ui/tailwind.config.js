/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', 'monospace'],
      },
      colors: {
        surface: {
          950: '#0a0e1a',
          900: '#0f1629',
          800: '#161d35',
          700: '#1e2847',
        },
        accent: {
          purple: '#a855f7',
          cyan: '#06b6d4',
          green: '#10b981',
        }
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
