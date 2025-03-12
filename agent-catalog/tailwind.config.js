/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#FF6B8B",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#6B9FFF",
          foreground: "hsl(var(--secondary-foreground))",
        },
        neon: {
          blue: "#2E3BFF",
          pink: "#FF2E88",
          purple: "#9B2EFF",
        },
        scifi: {
          dark: "#0A0F1C",
          light: "#1E2538",
          accent: "#2E3BFF",
        },
      },
      fontFamily: {
        orbitron: ["var(--font-orbitron)"],
        noto: ["var(--font-noto-sans-jp)"],
        "roboto-mono": ["var(--font-roboto-mono)"],
      },
      backgroundImage: {
        "tech-pattern":
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.343 0L13.858 8.485 15.272 9.9l7.9-7.9h-.83zm5.657 0L19.514 8.485 20.93 9.9l8.485-8.485h-1.415zM32.372 0L22.343 10.03 23.757 11.443l9.9-9.9h-1.285zm5.657 0l-12.728 12.73 1.414 1.413 12.73-12.73h-1.415zM38.03 0L25.3 12.73l1.414 1.414L41.37 0h-3.34zm5.656 0L30.957 12.73l1.415 1.414L47.027 0h-3.34zm5.657 0l-13.435 13.435 1.414 1.414L52.684 0h-3.34zm5.657 0L42.37 14.142l1.414 1.414L58.34 0h-3.34zM53.657 0L40.227 13.43l1.414 1.414L55.07 0h-1.413zM60 0L46.57 13.43l1.414 1.414L60 2.93V0zM60 5.657L49.042 16.614l1.414 1.414L60 8.587V5.657zm0 5.657L51.7 19.272l1.414 1.415L60 14.244v-2.93zm0 5.657l-5.657 5.657 1.414 1.415L60 19.9v-2.93zm0 5.657l-3 3 1.414 1.415L60 25.557v-2.93z' fill='%232E3BFF' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")",
      },
    },
  },
}

