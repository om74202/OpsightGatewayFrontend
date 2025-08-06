/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
  keyframes: {
    fadeInScale: {
      '0%': { opacity: 0, transform: 'scale(0.95)' },
      '100%': { opacity: 1, transform: 'scale(1)' }  // ❌ MISSING COMMA above
    }
  },
  animation: {
    fadeInScale: 'fadeInScale 0.4s ease-out',
  }
},
  },
  plugins: [],
}