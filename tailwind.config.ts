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
        // === PRIMARY PALETTE: Celadon + Warm Parchment ===
        // Nền tổng thể: kem giấy da xưa
        parchment: {
          50: "#FDFAF4",
          100: "#F9F3E8",
          200: "#F0E8D5",
          300: "#E4D5B8",
          400: "#CDB896",
        },
        // Xanh celadon: màu men gốm Á Đông
        celadon: {
          50:  "#F0FAF6",
          100: "#D6F2E6",
          200: "#A8E0C8",
          300: "#6EC9A8",
          DEFAULT: "#3DB38A",
          500: "#2E9A74",
          600: "#1F7F5E",
          dark:  "#165C44",
        },
        // Đỏ son truyền thống (thay coral Duolingo)
        vermillion: {
          light: "#FFEAEA",
          soft:  "#F9A8A8",
          DEFAULT: "#E05252",
          dark:  "#C23B3B",
          deep:  "#9B2626",
        },
        // Tím lavender nhạt cho điểm nhấn
        wisteria: {
          light: "#F3EFFF",
          soft:  "#C9BDF0",
          DEFAULT: "#7C5CBF",
          dark:  "#5B3FA0",
        },
        // Vàng hoàng kim nhạt
        gilt: {
          light: "#FFFBEB",
          soft:  "#FDE68A",
          DEFAULT: "#F5C842",
          dark:  "#D4A017",
          deep:  "#9C6F0A",
        },
        // Mực đen cổ điển (thay charcoal)
        ink: {
          light: "#7A7A7A",
          DEFAULT: "#2C2C2C",
          dark:  "#1A1A1A",
        },
        // Cấp độ HSK
        hsk: {
          basic:      "#3DB38A",
          basicLight: "#D6F2E6",
          basicDark:  "#1F7F5E",
          inter:      "#F5C842",
          interLight: "#FFFBEB",
          interDark:  "#D4A017",
          adv:        "#E05252",
          advLight:   "#FFEAEA",
          advDark:    "#C23B3B",
        },
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "var(--font-nunito)", "sans-serif"],
        display: ["var(--font-nunito)", "sans-serif"],
        chinese: ["var(--font-chinese)", "sans-serif"],
        mono:    ["ui-monospace", "monospace"],
      },
      boxShadow: {
        // Bóng mềm kiểu ứng dụng thiết kế cao cấp
        "soft":       "0 2px 12px rgba(44,44,44,0.06), 0 1px 4px rgba(44,44,44,0.04)",
        "medium":     "0 4px 20px rgba(44,44,44,0.09), 0 2px 6px rgba(44,44,44,0.05)",
        "lifted":     "0 8px 32px rgba(44,44,44,0.12), 0 2px 8px rgba(44,44,44,0.06)",
        "hover":      "0 12px 40px rgba(44,44,44,0.14), 0 4px 12px rgba(44,44,44,0.07)",
        // Glow cho màu accent
        "glow-green": "0 0 20px rgba(61,179,138,0.25)",
        "glow-red":   "0 0 20px rgba(224,82,82,0.2)",
        "glow-gold":  "0 0 20px rgba(245,200,66,0.25)",
        // Underline button (kiểu Notion)
        "btn-green":  "inset 0 -3px 0 rgba(31,127,94,0.5)",
        "btn-red":    "inset 0 -3px 0 rgba(194,59,59,0.5)",
        // inner
        "inner-soft": "inset 0 1px 4px rgba(44,44,44,0.06)",
      },
      borderRadius: {
        "2xl": "14px",
        "3xl": "20px",
        "4xl": "28px",
      },
      backgroundImage: {
        // Gradient tinh tế nền parchment
        "parchment-fade": "linear-gradient(135deg, #FDFAF4 0%, #F0E8D5 100%)",
        "celadon-fade":   "linear-gradient(135deg, #F0FAF6 0%, #D6F2E6 100%)",
        "gilt-fade":      "linear-gradient(135deg, #FFFBEB 0%, #FDE68A 50%, #FFFBEB 100%)",
        "ink-fade":       "linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%)",
        // Texture nhẹ cho card nổi bật
        "silk":           "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(240,232,213,0.4) 100%)",
      },
      animation: {
        "fade-up":    "fadeUp 0.22s ease-out forwards",
        "fade-in":    "fadeIn 0.18s ease-out forwards",
        "scale-in":   "scaleIn 0.2s ease-out forwards",
        "shimmer":    "shimmer 1.6s linear infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "float":      "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.65" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
