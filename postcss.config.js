module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'color-functional-notation': true,
        'relative-color-syntax': true,
      },
    },
  },
};
