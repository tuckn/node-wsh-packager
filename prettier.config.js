/** @type {import('prettier').Options} */
module.exports = {
  printWidth: 100,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  overrides: [
    {
      files: '*.{md,yml,yaml}',
      options: {
        printWidth: 80,
        semi: true,
        singleQuote: false,
        trailingComma: 'none',
      },
    },
  ],
};
