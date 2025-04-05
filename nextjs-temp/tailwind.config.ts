import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                gold: {
                    50: '#fffaeb',
                    100: '#fef0c7',
                    200: '#fee189',
                    300: '#fecb4c',
                    400: '#febc2e',
                    500: '#f59e0b', // More vibrant gold
                    600: '#d97706', // Amber gold
                    700: '#b45309',
                    800: '#92400e',
                    900: '#783610',
                    950: '#451f06',
                },
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: 'none',
                        color: '#333',
                        a: {
                            color: '#f59e0b',
                            '&:hover': {
                                color: '#d97706',
                            },
                        },
                    },
                },
                dark: {
                    css: {
                        color: '#d1d5db',
                        a: {
                            color: '#fecb4c',
                            '&:hover': {
                                color: '#fee189',
                            },
                        },
                        h1: {
                            color: '#f3f4f6',
                        },
                        h2: {
                            color: '#f3f4f6',
                        },
                        h3: {
                            color: '#f3f4f6',
                        },
                        h4: {
                            color: '#f3f4f6',
                        },
                    },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}

export default config;