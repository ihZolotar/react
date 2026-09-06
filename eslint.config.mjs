import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

const TS_FILES = ['src/**/*.ts', 'src/**/*.tsx'];

export default defineConfig([
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),

    js.configs.recommended,
    ...nextVitals,
    ...nextTypescript,

    ...tseslint.configs.recommendedTypeChecked.map((config) => ({
        ...config,
        files: TS_FILES,
    })),
    {
        files: TS_FILES,
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },

    prettierConfig,

    {
        rules: {
            'react/react-in-jsx-scope': 'off',
            '@typescript-eslint/no-unused-vars': ['warn'],
        },
    },

    {
        files: ['src/context/**'],
        rules: {
            'react-hooks/set-state-in-effect': 'warn',
        },
    },
]);
