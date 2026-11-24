import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FFFDF9",
          100: "#FFFBF5",
          200: "#FDF4E7",
          300: "#F7E8D3",
        },
        coral: {
          light: "#FFA0A0",
          DEFAULT: "#EF5B5B",
          dark: "#D94141",
          deep: "#B92B2B",
        },
        honey: {
          light: "#FFE382",
          DEFAULT: "#FFC94A",
          dark: "#E5AF30",
        },
        mint: {
          light: "#E8F8F0",
          DEFAULT: "#10B981",
          dark: "#059669",
        },
        hsk: {
          basic: "#10B981",
          basicDark: "#059669",
          basicLight: "#ECFDF5",
          inter: "#F59E0B",
          interDark: "#D97706",
          interLight: "#FFFBEB",
          adv: "#EF4444",
          advDark: "#DC2626",
          advLight: "#FEF2F2",
        },
        charcoal: {
          light: "#636E72",
          DEFAULT: "#2D3436",
          dark: "#1E272E",
        },
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "sans-serif"],
        chinese: ["var(--font-chinese)", "sans-serif"],
      },
      boxShadow: {
        duo: "0 4px 0 #E2D9CC",
        "duo-coral": "0 4px 0 #D94141",
        "duo-honey": "0 4px 0 #E5AF30",
        "duo-mint": "0 4px 0 #059669",
        "duo-pressed": "0 1px 0 #D94141",
        card: "0 6px 20px -2px rgba(45, 52, 54, 0.06)",
        "card-hover": "0 12px 28px -4px rgba(45, 52, 54, 0.12)",
      },
      borderRadius: {
        "2xl": "18px",
        "3xl": "24px",
      },
    },
  },
  plugins: [],
};
export default config;
