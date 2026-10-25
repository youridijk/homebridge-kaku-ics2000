import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import {defineConfig} from 'eslint/config';

export default defineConfig([
  {
    ignores: ['dist/**', 'src/platform.ts', 'src/platformAccessory.ts'],
  },
  {
    files: ['src/**/*.ts'],
    extends: [js.configs.recommended, tsPlugin.configs['flat/recommended']],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/quotes': ['warn', 'single'],
      '@stylistic/indent': ['warn', 2, {SwitchCase: 1}],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/comma-dangle': ['warn', 'always-multiline'],
      'dot-notation': 'off',
      eqeqeq: ['warn', 'allow-null'],
      curly: ['warn', 'all'],
      '@stylistic/brace-style': ['warn'],
      'prefer-arrow-callback': ['warn'],
      '@stylistic/max-len': ['warn', 140],
      'no-console': ['warn'],
      '@stylistic/comma-spacing': ['error'],
      '@stylistic/no-multi-spaces': ['warn', {ignoreEOLComments: true}],
      '@stylistic/lines-between-class-members': ['warn', 'always', {exceptAfterSingleLine: true}],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@stylistic/member-delimiter-style': ['warn'],
    },
  },
]);
