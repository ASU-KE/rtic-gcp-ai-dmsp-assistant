import globals from 'globals';
import pluginJs from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'], languageOptions: {
      parser: tsParser,
      sourceType: 'module',
      globals: globals.browser,
    }
  },
  pluginJs.configs.recommended,
  tsPlugin.configs.recommended,
];
