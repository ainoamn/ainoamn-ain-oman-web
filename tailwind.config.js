/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.{css}"
  ],
  theme: {
    extend: {
      colors: {
        // ربط درجات brand بمتغيرات CSS الموجودة في globals.css
        brand: {
          50:  "var(--brand-50)",
          100: "var(--brand-100)",
          200: "var(--brand-200)",
          300: "var(--brand-300)",
          400: "var(--brand-400)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          800: "var(--brand-800)",
          900: "var(--brand-900)"
        }
      }
    }
  },
  safelist: [
    // لضمان توافر هذه المرافق حتى لو استُخدمت داخل @apply
    { pattern: /(bg|text|border|ring)-brand-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /(hover:)?text-brand-(400|500|600|700)/ },
    { pattern: /focus:ring-brand-(400|500|600)/ }
  ],
  plugins: []
};
