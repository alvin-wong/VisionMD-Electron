module.exports = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'avoid',
  overrides: [
    {
      files: '*.json',
      options: {
        parser: 'json',
      },
    },
  ],
};
