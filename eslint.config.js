// ESLint 9.x 配置文件，适用于 Next.js + TypeScript + Prettier
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import next from 'eslint-config-next';
import prettier from 'eslint-config-prettier';

export default [
  js.config({
    extends: [],
  }),
  ...tseslint.config({
    extends: [],
  }),
  ...next,
  prettier,
  {
    rules: {
      // 可根据需要自定义规则
      'no-unused-vars': 'warn',
      'react/display-name': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]; 