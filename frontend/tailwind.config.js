/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': '#F8FAFC',
        surface: '#FFFFFF',
        emergency: { DEFAULT: '#DC2626', dark: '#B91C1C', light: '#FEE2E2' },
        warning: { DEFAULT: '#EA580C', light: '#FFEDD5' },
        safe: { DEFAULT: '#16A34A', light: '#DCFCE7' },
        advisory: { DEFAULT: '#CA8A04', light: '#FEF9C3' },
        'gov-blue': { DEFAULT: '#2563EB', dark: '#1D4ED8', light: '#DBEAFE' },
        'text-primary': '#111827',
        'text-secondary': '#4B5563',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      minHeight: {
        tap: '48px',
      },
      minWidth: {
        tap: '48px',
      },
    },
  },
  plugins: [],
}
