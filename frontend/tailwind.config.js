/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Cabinet Grotesk"', "sans-serif"],
                body: ['"Satoshi"', "sans-serif"],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                navy: {
                    DEFAULT: "#0F172A",
                    soft: "#1E293B",
                },
                lime: {
                    DEFAULT: "#CCFF00",
                    hover: "#B3E600",
                },
                sky: {
                    mist: "#F0F7FC",
                    glow: "#E0F2FE",
                },
            },
            backgroundImage: {
                "app-gradient": "linear-gradient(135deg, #F0F7FC 0%, #E0F2FE 50%, #DCEEFB 100%)",
                "hero-radial":
                    "radial-gradient(1200px 600px at 20% 10%, rgba(204,255,0,0.08), transparent 60%), radial-gradient(900px 500px at 90% 30%, rgba(59,130,246,0.12), transparent 60%)",
            },
            boxShadow: {
                glass: "0 8px 32px rgba(15,23,42,0.04)",
                floating: "0 20px 40px rgba(15,23,42,0.08)",
                cta: "0 8px 24px rgba(204,255,0,0.35)",
                sos: "0 8px 24px rgba(239,68,68,0.4)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "fade-up": {
                    "0%": { opacity: "0", transform: "translateY(12px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                float: {
                    "0%,100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-8px)" },
                },
                "pulse-sos": {
                    "0%,100%": { boxShadow: "0 0 0 0 rgba(239,68,68,0.6)" },
                    "50%": { boxShadow: "0 0 0 16px rgba(239,68,68,0)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-up": "fade-up 0.6s ease-out both",
                float: "float 5s ease-in-out infinite",
                "pulse-sos": "pulse-sos 2s ease-in-out infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
