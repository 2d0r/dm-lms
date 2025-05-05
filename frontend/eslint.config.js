import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";


export default defineConfig([
  pluginReact.configs.flat.recommended,
  { 
    files: ["**/*.{js,mjs,cjs,jsx}"], 
    plugins: { js }, 
    extends: ["js/recommended"],
    ignores: ['dist/**'],
  },
  { 
    files: ["**/*.{js,mjs,cjs,jsx}"], 
    languageOptions: { globals: globals.browser },
    ignores: ['dist/**'],
  },
  {
    plugins: { pluginReact },
    rules: {
      'react/prop-types': 'off', // Disable prop-types rule
    },
    settings: {react: { version: 'detect' }},
  },
]);