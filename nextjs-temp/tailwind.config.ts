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
                primary: {
                    DEFAULT: '#f59e0b',
                    light: '#fcd34d',
                    dark: '#d97706',
                },
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
            typography: (theme: (path: string) => string) => ({
                DEFAULT: {
                    css: {
                        maxWidth: 'none',
                        color: theme('colors.gray.700'),
                        a: {
                            color: theme('colors.primary.DEFAULT'),
                            '&:hover': {
                                color: theme('colors.primary.dark'),
                            },
                        },
                    },
                },
                dark: {
                    css: {
                        color: theme('colors.gray.300'),
                        a: {
                            color: theme('colors.primary.light'),
                            '&:hover': {
                                color: theme('colors.primary.DEFAULT'),
                            },
                        },
                        h1: {
                            color: theme('colors.gray.100'),
                        },
                        h2: {
                            color: theme('colors.gray.100'),
                        },
                        h3: {
                            color: theme('colors.gray.100'),
                        },
                        h4: {
                            color: theme('colors.gray.100'),
                        },
                        h5: {
                            color: theme('colors.gray.100'),
                        },
                        h6: {
                            color: theme('colors.gray.100'),
                        },
                        strong: {
                            color: theme('colors.gray.100'),
                        },
                        code: {
                            color: theme('colors.gray.300'),
                            backgroundColor: theme('colors.gray.800'),
                        },
                        blockquote: {
                            color: theme('colors.gray.300'),
                            borderLeftColor: theme('colors.gray.700'),
                        },
                        hr: {
                            borderColor: theme('colors.gray.700'),
                        },
                        ol: {
                            li: {
                                '&:before': {
                                    color: theme('colors.gray.500'),
                                },
                            },
                        },
                        ul: {
                            li: {
                                '&:before': {
                                    backgroundColor: theme('colors.gray.500'),
                                },
                            },
                        },
                        pre: {
                            backgroundColor: theme('colors.gray.800'),
                        },
                        thead: {
                            color: theme('colors.gray.100'),
                            borderBottomColor: theme('colors.gray.700'),
                        },
                        tbody: {
                            tr: {
                                borderBottomColor: theme('colors.gray.700'),
                            },
                        },
                    },
                },
            }),
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}

export default config;