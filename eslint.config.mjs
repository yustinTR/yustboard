// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      ".vercel/**",
      "out/**",
      "build/**",
      "dist/**",
      "storybook-static/**",
      "*.config.js",
      "*.config.mjs",
      "scripts/**",
      "jest.config.js",
      "next-env.d.ts",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "vitest.config.ts",
      "vitest.setup.ts",
      "e2e/**",
      "playwright-report/**",
      "test-results/**",
      "coverage/**"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...storybook.configs["flat/recommended"]
];

export default eslintConfig;
