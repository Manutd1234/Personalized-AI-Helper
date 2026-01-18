import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#8b5cf6",
                    light: "#a78bfa",
                    dark: "#7c3aed",
                },
                secondary: "#06b6d4",
                tertiary: "#10b981",
                background: {
                    primary: "#0a0a0f",
                    secondary: "#12121a",
                    tertiary: "#1a1a25",
                    elevated: "#22222f",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            animation: {
                glow: "glow 2s ease-in-out infinite",
                "fade-in": "fadeIn 0.3s ease",
            },
            keyframes: {
                glow: {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" },
                    "50%": { boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)" },
                },
                fadeIn: {
                    from: { opacity: "0", transform: "translateY(10px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
            },
        },
    },
    plugins: [],
};
export default config;
