/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        helcyon: {
          dark: '#0A0E17',
          card: '#131B2E',
          surface: '#182238',
          border: '#1E293B',
          muted: '#94A3B8',
          primary: '#10B981',       // Emerald
          'primary-hover': '#059669',
          accent: '#06B6D4',        // Cyan
          'accent-hover': '#0891B2',
          danger: '#F43F5E',        // Rose
          warning: '#F59E0B',       // Amber
          success: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px -5px rgba(16, 185, 129, 0.25)',
        'glow-accent': '0 0 20px -5px rgba(6, 182, 212, 0.25)',
      },
    },
  },
  plugins: [],
};
