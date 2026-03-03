import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                heading: ['var(--font-poppins)', 'sans-serif'],
            },
            fontSize: {
                // Semantic Typography Scale
                'display': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '400' }], // 72px
                'h1': ['3.5rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '400' }], // 56px
                'h2': ['2.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '400' }], // 40px
                'h3': ['2rem', { lineHeight: '1.4', letterSpacing: '-0.005em', fontWeight: '400' }], // 32px
                'h4': ['1.5rem', { lineHeight: '1.5', letterSpacing: '0em', fontWeight: '500' }], // 24px
                'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0em', fontWeight: '400' }], // 18px
                'body': ['1rem', { lineHeight: '1.6', letterSpacing: '0em', fontWeight: '400' }], // 16px
                'small': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0em', fontWeight: '400' }], // 14px
                'caption': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em', fontWeight: '500' }], // 12px
            },
            spacing: {
                '18': '4.5rem', // 72px
                '26': '6.5rem', // 104px
                '30': '7.5rem', // 120px
                '34': '8.5rem', // 136px
                '40': '10rem',  // 160px
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'subtle': '0 2px 10px -2px rgba(0, 0, 0, 0.02)',
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
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        }
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;
