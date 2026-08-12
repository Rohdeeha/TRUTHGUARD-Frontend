import type { Config } from 'tailwindcss';

export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    dark: '#061528',     // Deep Navy Background
                    card: '#0E243F',     // Card / Container Background
                    border: '#1A3352',   // Subtle Border Color
                    orange: '#E55322',   // Primary Accent / TRUTH
                    cyan: '#1CB5BE',     // Secondary Accent / FACTCHECK
                },
            },
        },
    },
    plugins: [],
} satisfies Config;