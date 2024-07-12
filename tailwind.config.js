/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts"],
  theme: {
    extend: {
      colors: {
        background: "#131515",
        sunny: "#498FE0",
        cloudy: "#5A6F79",
        rainy: "#56565C",
        snowy: "#FFFAFB",
      },
    },
  },
  plugins: [],
};
