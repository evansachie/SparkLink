/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0DBFB6",
          dark: "#0a968f",
          light: "#e6fcfa",
        },
        accent: {
          DEFAULT: "#764ba2",
          light: "#a084ca",
        },
        black: "#18181b",
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        error: "#ef4444",
        success: "#22c55e",
      },
    },
  },
  plugins: [],
}

