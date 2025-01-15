import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends(
        "next/core-web-vitals",
        "next/typescript",
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier"
    ),
    {
        rules: {
            "react/react-in-jsx-scope": "off",
            "indent": ["error", 4],
            "quotes": ["error", "double"],
            "semi": ["error", "always"],
            "@typescript-eslint/no-unused-vars": ["warn"],
        },
    },
];

export default eslintConfig;
