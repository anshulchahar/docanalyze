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
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                ping: {
                    '75%, 100%': {
                        transform: 'scale(2)',
                        opacity: '0',
                    },
                },
                pulse: {
                    '50%': {
                        opacity: '.5',
                    },
                },
                bounce: {
                    '0%, 100%': {
                        transform: 'translateY(-10%)',
                        animationTimingFunction: 'cubic-bezier(0.8,0,1,1)',
                    },
                    '50%': {
                        transform: 'none',
                        animationTimingFunction: 'cubic-bezier(0,0,0.2,1)',
                    },
                },
                errorShake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px)' },
                    '50%': { transform: 'translateX(5px)' },
                    '75%': { transform: 'translateX(-5px)' },
                },
            },
            animation: {
                bounce: 'bounce 1s infinite',
                ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                spin: 'spin 1s linear infinite',
                fadeIn: 'fadeIn 0.3s ease-in-out',
                errorShake: 'errorShake 0.3s ease-in-out',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}

export default config;