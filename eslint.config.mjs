import { dirname } from "path";
import { fileURLToPath } from "url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

const typeCheckedConfig = compat
    .extends("plugin:@typescript-eslint/recommended-type-checked")
    .map((config) => ({
        ...config,
        files: ["src/**/*.ts", "src/**/*.tsx"],
        languageOptions: {
            ...config.languageOptions,
            parserOptions: {
                ...config.languageOptions?.parserOptions,
                project: "./tsconfig.json",
                tsconfigRootDir: __dirname,
            },
        },
    }));

const eslintConfig = [
    {
        ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
    },
    js.configs.recommended,
    ...compat.extends(
        "next/core-web-vitals",
        "next/typescript",
        "plugin:@typescript-eslint/recommended",
        "prettier"
    ),
    ...typeCheckedConfig,
    {
        rules: {
            "react/react-in-jsx-scope": "off",
            "@typescript-eslint/no-unused-vars": ["warn"],
        },
    },
];

export default eslintConfig;
