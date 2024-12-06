// tailwind.config.js
import type { Config } from "tailwindcss";

const config: Config = {
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
      },
      fontFamily: {
        mono: ['Courier', 'monospace'],
      },
      animation: {
        typing: 'typing 3s steps(22) forwards',
        blink: 'blink 1s step-end infinite',
        typewriter: 'typing 3s steps(22) forwards, blink 1s step-end infinite',
      },
      keyframes: {
        typing: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        blink: {
          '50%': { borderColor: 'transparent' },
        },
      },
      fontSize: {
        'xxl': '3rem',  // Tamaño de fuente personalizado
        'xxxl': '4rem', // Otro tamaño de fuente
      },
    },
  },
  plugins: [],
};

export default config;
