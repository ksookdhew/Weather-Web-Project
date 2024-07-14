/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts}"],
  theme: {
    extend: {
      colors: {
        background: "#131515",
        sunny: "#498FE0",
        cloudy: "#90a5af",
        rainy: "#56565C",
        snowy: "##ccc9bb",
        thunderstorm: "56565C",
      },
    },
  },
  plugins: [],
};
