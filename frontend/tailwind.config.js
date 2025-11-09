import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          600: '#1D4ED8'
        },
        accent: '#06B6D4',
        surface: '#FFFFFF',
        page: '#F8FAFC',
        muted: '#6B7280',
        body: '#0F172A',
        border: '#E6E9EE'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto']
      },
      boxShadow: {
        smsoft: '0 6px 18px rgba(15,23,42,0.06)'
      },
      borderRadius: {
        lg: '10px'
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["corporate"],
  },
};