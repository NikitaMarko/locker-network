// @ts-check
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const importPlugin = require('eslint-plugin-import');

module.exports = defineConfig([
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'src/prisma/**',
            'coverage/**',
        ],
    },
    {
        files: ['src/**/*.ts'],
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            'import': importPlugin,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: __dirname,
            },
        },
        settings: {
            'import/resolver': {
                typescript: {
                    project: './tsconfig.json',
                },
                node: true,
            },
        },
        rules: {
            // =============== TypeScript ===============
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': 'error',

            // =============== Imports ===============
            'import/no-unresolved': 'error',
            'import/named': 'error',
            'import/no-duplicates': 'error',
            'import/order': ['warn', {
                groups: [
                    'builtin',
                    'external',
                    'internal',
                    'parent',
                    'sibling',
                    'index',
                ],
                'newlines-between': 'always',
            }],

            // =============== General ===============
            'no-console': 'warn',
            'no-var': 'error',
            'prefer-const': 'error',
            'eqeqeq': ['error', 'always'],
        },
    },
]);