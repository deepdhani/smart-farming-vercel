/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: "#2d6a4f", light: "#52b788", dark: "#1b4332" },
        accent:   { DEFAULT: "#f4a261", light: "#ffddd2" },
        earth:    { DEFAULT: "#8b5e3c", light: "#c9a87c" },
        sky:      { DEFAULT: "#90e0ef", dark: "#0096c7" },
        warn:     { DEFAULT: "#e63946", light: "#ffc8c8" },
      },
      fontFamily: {
        sans: ["'Noto Sans'", "sans-serif"],
        devanagari: ["'Noto Sans Devanagari'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
