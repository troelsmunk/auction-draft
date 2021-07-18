module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  sourceType: module,
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    quotes: ["error", "double"],
    semi: 0,
  },
}
