/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F1923',
          50: '#1A2736',
          100: '#15202C',
          900: '#0A1018',
        },
        gold: {
          DEFAULT: '#E8B84B',
          light: '#F0CA6E',
          dark: '#D4A53A',
          50: '#FDF5E3',
        },
        emerald: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#F87171',
        },
        amber: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
        },
        surface: '#FFFFFF',
        bg: '#F8F7F4',
        border: '#E2E8F0',
        text: '#1A1A2E',
        muted: '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        'tight-heading': '-0.03em',
      },
      borderRadius: {
        'card': '16px',
        'input': '10px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10)',
        'gold': '0 0 20px rgba(232,184,75,0.3)',
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'count-up': 'countUp 2s ease-out',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(232,184,75,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(232,184,75,0.5)' },
        },
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slideUp': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
