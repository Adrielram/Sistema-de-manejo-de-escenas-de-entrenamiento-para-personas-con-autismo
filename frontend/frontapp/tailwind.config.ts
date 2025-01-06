import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#f6512b",
          dark: "#e81e25",
          blue_small_button: "#12509d",
        },
        greens: {
          light_green: "#e8f2e3",
        } 
      },
      fontFamily: {
        sans: ["Inter", "Helvetica", "Arial", "sans-serif"], // Base para textos
        serif: ["Merriweather", "Georgia", "serif"], // Clásica para títulos
        mono: ["Fira Code", "Courier New", "monospace"], // Ideal para código
        display: ["Poppins", "Oswald", "sans-serif"], // Para encabezados llamativos
        body: ["Roboto", "Open Sans", "sans-serif"], // Para contenido general
      },
    },
  },
  plugins: [],
} satisfies Config;
