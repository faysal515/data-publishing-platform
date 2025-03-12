import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-blue-100",
    "bg-green-100",
    "bg-purple-100",
    "text-blue-800",
    "text-green-800",
    "text-purple-800",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        blue: {
          100: "var(--color-blue-100)",
          300: "var(--color-blue-300)",
          800: "var(--color-blue-800)",
        },
        green: {
          100: "var(--color-green-100)",
          300: "var(--color-green-300)",
          800: "var(--color-green-800)",
        },
        purple: {
          100: "var(--color-purple-100)",
          300: "var(--color-purple-300)",
          800: "var(--color-purple-800)",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "inherit",
            a: {
              color: "inherit",
              textDecoration: "underline",
              fontWeight: "500",
            },
            strong: {
              color: "inherit",
              fontWeight: "600",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
