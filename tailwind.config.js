/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#0F111A',
          light: '#171A25'
        },
        teal: {
          accent: '#3FC7B5'
        },
        violet: {
          accent: '#9C8CFF'
        },
        coral: {
          accent: '#FF6B6B'
        }
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
