/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stream-dark': '#1a1a1a',
        'stream-darker': '#0f0f0f',
        'stream-light': '#2a2a2a',
        'stream-gray': '#333333',
        'stream-accent': '#3b82f6',
      },
    },
  },
  plugins: [],
}

