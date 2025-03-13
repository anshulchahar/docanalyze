import reactPlugin from 'eslint-plugin-react';
import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                // React globals
                React: 'readonly',
                ReactDOM: 'readonly',

                // Browser globals
                document: 'readonly',
                window: 'readonly',
                fetch: 'readonly',
                FormData: 'readonly',
                alert: 'readonly',
                console: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                navigator: 'readonly',
                location: 'readonly',
                Blob: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                FileReader: 'readonly',
                Audio: 'readonly'
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        plugins: {
            react: reactPlugin
        },
        rules: {
            // Allow React without importing in files using React.createElement
            'react/react-in-jsx-scope': 'off',
            // Adjust indentation
            'indent': ['error', 2],
            // Enforce semi-colons
            'semi': ['error', 'always'],
            // No unused variables
            'no-unused-vars': 'warn',
            // No console logs in production
            'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        },
        settings: {
            react: {
                version: 'detect'
            }
        }
    },
    // Add a specific config for script.js to handle vanilla JS
    {
        files: ['**/script.js'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'script', // Change to script mode for vanilla JS files
            globals: {
                // Browser globals
                document: 'readonly',
                window: 'readonly',
                fetch: 'readonly',
                FormData: 'readonly',
                alert: 'readonly',
                console: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                navigator: 'readonly',
                location: 'readonly',
                Blob: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                FileReader: 'readonly'
            }
        },
        // Disable React specific rules for script.js
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/jsx-uses-react': 'off',
            'react/jsx-uses-vars': 'off'
        }
    }
];
