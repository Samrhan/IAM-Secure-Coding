module.exports = {
  root: true,
  env: { node: true },
  parser: '@typescript-eslint/parser',
  plugins: [ '@typescript-eslint' ],
  parserOptions: {
    project: './tsconfig.json'
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  rules: {
    // I let the compiler infer the return utils of methods, functions... itself.
    // For my use, I do not need a stable interface for outside modules, because I am
    // the only one to consume my own code. It is another story if you build a library with a stable interface.
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // The 'any' type should be used with caution.
    // Still, I sometime use it for ugly legacy code or well scoped area.
    // PS: a better alternative would be the `unknown` type and turn the rule on again.
    '@typescript-eslint/no-explicit-any': 'off',

    // Feel free to enable/disable some rules depending on your needs.

    // We need to deal with 'any' values when doing meta-programming or testing it
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
  }
}
