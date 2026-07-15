import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151726", // near-black, slightly blue — base text/background
        paper: "#F7F6F2", // warm off-white background
        signal: "#3D5A80", // muted slate blue — primary accent
        ember: "#EE964B", // warm amber — secondary accent, used sparingly (risk flags)
        line: "#DAD7CE", // hairline borders
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
