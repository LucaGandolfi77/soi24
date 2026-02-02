module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-console': 'off'
  }
  ,
  overrides: [
    {
      files: ['app.js','generate-icons.js','index.js','manifest.js'],
      excludedFiles: ['tools/**','__tests__/**','coverage/**'],
      env: { browser: true }
    },
    {
      files: ['service-worker.js'],
      env: { serviceworker: true, browser: true }
    }
  ]
};
