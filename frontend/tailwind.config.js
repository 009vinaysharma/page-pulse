/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep "night monitor" background tones
        midnight: {
          950: '#050914',
          900: '#0B1120',
          800: '#111827',
          700: '#1B2333',
        },
        // Signature pulse accent (cyan) - represents an active/healthy signal
        pulse: {
          400: '#4DE8E0',
          500: '#22D3C6',
          600: '#0FB8AC',
        },
        // Vital accent for warnings/errors (rose)
        vital: {
          400: '#FB7185',
          500: '#F43F5E',
        },
        indigoglow: {
          500: '#6366F1',
          600: '#4F46E5',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        pulseLine: {
          '0%, 100%': { strokeDashoffset: '0' },
          '50%': { strokeDashoffset: '-40' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        pulseLine: 'pulseLine 1.4s linear infinite',
        fadeUp: 'fadeUp 0.5s ease-out both',
        blink: 'blink 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
