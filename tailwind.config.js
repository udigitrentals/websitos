/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sage: "#6B8E23",
        warrior: "#B22222",
        trickster: "#8A2BE2",
        aurora1: "#4f46e5",
        aurora2: "#9333ea",
        aurora3: "#ec4899",
        aurora4: "#f59e0b",
      },
      backgroundImage: {
        aurora: "linear-gradient(135deg, #4f46e5, #9333ea, #ec4899, #f59e0b)",
      },
    },
  },
  plugins: [],
};
