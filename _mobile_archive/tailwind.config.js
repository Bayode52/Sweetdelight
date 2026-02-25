/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bakery: {
          gold: "#D4AF37",
          cream: "#FFFDD0",
          chocolate: "#3D1E06",
          berry: "#8B0000",
          glaze: "rgba(255, 255, 255, 0.15)",
        },
      },
    },
  },
  plugins: [],
};
