/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
             primary: ["BricolageGrotesque_400Regular"],
             secondary: ["BricolageGrotesque_500Medium"],
             heading: ["BricolageGrotesque_700Bold"],
             zelox: ["GasoekOne_400Regular"],
           },
    },
  },
  plugins: [],
};