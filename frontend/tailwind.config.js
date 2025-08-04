/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color system
        'cyber-blue': '#00d4ff',
        'neon-purple': '#b347d9',
        'electric-green': '#00ff88',
        'plasma-orange': '#ff6b35',
        
        // Background colors
        'bg-primary': '#0a0a0f',
        'bg-secondary': '#141419',
        'bg-tertiary': '#1e1e26',
        
        // Glass effects
        'glass-bg': 'rgba(255, 255, 255, 0.05)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        
        // Text colors
        'text-primary': '#ffffff',
        'text-secondary': '#a0a0a8',
        'text-muted': '#666670',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'pulse-slow-delay': 'pulse 4s ease-in-out infinite 2s',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-in-right': 'slide-in-from-right 0.5s ease-out',
        'slide-in-left': 'slide-in-from-left 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'spin-reverse': 'spin-reverse 1s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(0, 212, 255, 0.6), 0 0 60px rgba(179, 71, 217, 0.3)' 
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-in-from-right': {
          'from': { transform: 'translateX(100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-from-left': {
          'from': { transform: 'translateX(-100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in-up': {
          'from': { transform: 'translateY(30px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        'spin-reverse': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(-360deg)' },
        },
      },
      backdropBlur: {
        '20': '20px',
        '30': '30px',
      },
      screens: {
        'xs': '475px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}