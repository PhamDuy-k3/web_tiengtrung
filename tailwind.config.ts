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
        // ============================================================
        // NEW PALETTE v2: Á Đông hiện đại
        // ============================================================

        // Nền kem giấy da — thay cream
        parchment: {
          50:  "#FDFAF4",
          100: "#F9F3E8",
          200: "#F0E8D5",
          300: "#E4D5B8",
          400: "#CDB896",
        },
        // Xanh celadon men gốm Á Đông
        celadon: {
          50:      "#F0FAF6",
          100:     "#D6F2E6",
          200:     "#A8E0C8",
          300:     "#6EC9A8",
          DEFAULT: "#3DB38A",
          500:     "#2E9A74",
          600:     "#1F7F5E",
          dark:    "#165C44",
        },
        // Đỏ son truyền thống — thay coral
        vermillion: {
          light:   "#FFEAEA",
          soft:    "#F9A8A8",
          DEFAULT: "#E05252",
          dark:    "#C23B3B",
          deep:    "#9B2626",
        },
        // Tím lavender nhạt
        wisteria: {
          light:   "#F3EFFF",
          soft:    "#C9BDF0",
          DEFAULT: "#7C5CBF",
          dark:    "#5B3FA0",
        },
        // Vàng hoàng kim
        gilt: {
          light:   "#FFFBEB",
          soft:    "#FDE68A",
          DEFAULT: "#F5C842",
          dark:    "#D4A017",
          deep:    "#9C6F0A",
        },
        // Mực đen cổ điển — thay charcoal
        ink: {
          light:   "#7A7A7A",
          DEFAULT: "#2C2C2C",
          dark:    "#1A1A1A",
        },

        // ============================================================
        // LEGACY PALETTE v1 — giữ lại để quiz components vẫn hoạt động
        // ============================================================
        cream: {
          50:  "#FFFDF9",
          100: "#FFFBF5",
          200: "#FDF4E7",
          300: "#F7E8D3",
        },
        coral: {
          light:   "#FFA0A0",
          DEFAULT: "#EF5B5B",
          dark:    "#D94141",
          deep:    "#B92B2B",
        },
        honey: {
          light:   "#FFE382",
          DEFAULT: "#FFC94A",
          dark:    "#E5AF30",
        },
        mint: {
          light:   "#E8F8F0",
          DEFAULT: "#10B981",
          dark:    "#059669",
        },
        charcoal: {
          light:   "#636E72",
          DEFAULT: "#2D3436",
          dark:    "#1E272E",
        },

        // HSK level colours (dual: new + legacy keys)
        hsk: {
          basic:      "#3DB38A",
          basicDark:  "#1F7F5E",
          basicLight: "#D6F2E6",
          inter:      "#F5C842",
          interDark:  "#D4A017",
          interLight: "#FFFBEB",
          adv:        "#E05252",
          advDark:    "#C23B3B",
          advLight:   "#FFEAEA",
        },
      },

      fontFamily: {
        sans:    ["var(--font-nunito)", "sans-serif"],
        display: ["var(--font-nunito)", "sans-serif"],
        chinese: ["var(--font-chinese)", "sans-serif"],
      },

      boxShadow: {
        // ── New v2 shadows ──────────────────────────────────────────
        soft:         "0 2px 12px rgba(44,44,44,0.06), 0 1px 4px rgba(44,44,44,0.04)",
        medium:       "0 4px 20px rgba(44,44,44,0.09), 0 2px 6px rgba(44,44,44,0.05)",
        lifted:       "0 8px 32px rgba(44,44,44,0.12), 0 2px 8px rgba(44,44,44,0.06)",
        hover:        "0 12px 40px rgba(44,44,44,0.14), 0 4px 12px rgba(44,44,44,0.07)",
        "inner-soft": "inset 0 1px 4px rgba(44,44,44,0.06)",
        // Glow accents
        "glow-green": "0 0 20px rgba(61,179,138,0.25)",
        "glow-red":   "0 0 20px rgba(224,82,82,0.2)",
        "glow-gold":  "0 0 20px rgba(245,200,66,0.25)",

        // ── Legacy v1 shadows (quiz components) ─────────────────────
        duo:          "0 4px 0 #E2D9CC",
        "duo-coral":  "0 4px 0 #D94141",
        "duo-honey":  "0 4px 0 #E5AF30",
        "duo-mint":   "0 4px 0 #059669",
        "duo-pressed":"0 1px 0 #D94141",
        card:         "0 6px 20px -2px rgba(45, 52, 54, 0.06)",
        "card-hover": "0 12px 28px -4px rgba(45, 52, 54, 0.12)",
      },

      borderRadius: {
        "2xl": "14px",
        "3xl": "20px",
        "4xl": "28px",
      },

      backgroundImage: {
        "parchment-fade": "linear-gradient(135deg, #FDFAF4 0%, #F0E8D5 100%)",
        "celadon-fade":   "linear-gradient(135deg, #F0FAF6 0%, #D6F2E6 100%)",
        "gilt-fade":      "linear-gradient(135deg, #FFFBEB 0%, #FDE68A 50%, #FFFBEB 100%)",
      },

      animation: {
        "fade-up":  "fadeUp 0.22s ease-out forwards",
        "fade-in":  "fadeIn 0.18s ease-out forwards",
        "scale-in": "scaleIn 0.2s ease-out forwards",
        shimmer:    "shimmer 1.6s linear infinite",
        float:      "float 3s ease-in-out infinite",
        // legacy
        fadeIn:     "fadeIn 0.18s ease-out forwards",
      },

      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "scale(0.98)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
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
