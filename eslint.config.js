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
                React: 'readonly',
                ReactDOM: 'readonly'
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
    }
];
