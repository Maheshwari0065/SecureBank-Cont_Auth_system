/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00f2fe", // Glowing neon cyan
          dark: "#028090",
        },
        cyber: {
          dark: "#030712",    // Slate 950
          card: "#0f172a",    // Slate 900
          border: "#1e293b",  // Slate 800
          accent: "#ff007f",  // Neon pink
          purple: "#7b2cbf",  // Cyber purple
          green: "#00f5d4",   // Neo teal-green
          amber: "#f59e0b",
        }
      },
      boxShadow: {
        'glow-teal': '0 0 15px rgba(0, 242, 254, 0.4)',
        'glow-red': '0 0 15px rgba(239, 68, 68, 0.4)',
        'glow-purple': '0 0 15px rgba(123, 44, 191, 0.4)',
        'glow-green': '0 0 15px rgba(0, 245, 212, 0.4)',
        'glow-amber': '0 0 15px rgba(245, 158, 11, 0.4)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
