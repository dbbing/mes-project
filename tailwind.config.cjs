/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      minHeight: (theme) => ({
        ...theme("spacing"),
      }),
      minWidth: (theme) => ({
        ...theme("spacing"),
      }),
      backgroundImage: {
        'login-light': "url('@/assets/login/login-light.png')",
        'login-dark': "url('@/assets/login/login-dark.png')",
      },
      sizing: {},
      spacing: {},
      colors: {},
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
