/** @type {import('prettier').Options} */
module.exports = {
  printWidth: 80,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  trailingComma: 'all',
  endOfLine: 'lf',
  overrides: [
    {
      files: '*.{md}',
      options: {
        proseWrap: 'never',
        singleQuote: false,
        trailingComma: 'none',
      },
    },
    {
      files: '*.{yml,yaml}',
      options: {
        singleQuote: false,
        trailingComma: 'none',
      },
    },
  ],
};
