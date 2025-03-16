/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./templates/**/*.html",
        "./static/**/*.js"
    ],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            container: {
                center: true,
                padding: {
                    DEFAULT: '1rem',
                    sm: '2rem',
                    lg: '4rem',
                    xl: '5rem',
                },
            },
            colors: {
                accent: 'var(--accent-color)',
                secondary: 'var(--secondary-color)',
                background: 'var(--background-color)',
                'card-bg': 'var(--card-background)',
                'card-border': 'var(--card-border)',
            },
        },
    },
    plugins: [],
}