/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#06243d',
          800: '#0b3d66',
          700: '#0f4f82',
          600: '#15639d',
          500: '#1e7bbf',
          100: '#e3eef6',
          50: '#f3f8fb',
        },
        slate: {
          950: '#0b1620',
        },
        status: {
          draft: '#6b7280',
          review: '#b45309',
          sent: '#1d4ed8',
          accepted: '#15803d',
          rejected: '#b91c1c',
        },
        compliance: {
          pass: '#15803d',
          warn: '#b45309',
          fail: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
