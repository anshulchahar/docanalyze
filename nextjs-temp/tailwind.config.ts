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
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: 'none',
                        color: '#333',
                        a: {
                            color: '#3182ce',
                            '&:hover': {
                                color: '#2c5282',
                            },
                        },
                    },
                },
                dark: {
                    css: {
                        color: '#d1d5db',
                        a: {
                            color: '#60a5fa',
                            '&:hover': {
                                color: '#93c5fd',
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