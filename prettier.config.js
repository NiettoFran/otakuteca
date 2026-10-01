/** @type {import('prettier').Config} */
export default {
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'es5',
  tabWidth: 2,
  useTabs: false,
  printWidth: 100,
  arrowParens: 'always',
  plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  importOrder: ['<BUILTIN_MODULES>', '<THIRD_PARTY_MODULES>', '', '^@/(.*)$', '', '^[./]'],
  importOrderTypeScriptVersion: '6.0.0',
  tailwindStylesheet: './src/styles/index.css',
  tailwindFunctions: ['cn', 'cva', 'clsx'],
}
