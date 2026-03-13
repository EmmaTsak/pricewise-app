export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./client/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(214 32% 91%)",
        input: "hsl(214 32% 91%)",
        ring: "hsl(215 20% 65%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(222 47% 11%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}