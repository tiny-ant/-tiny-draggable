export default {
  root: true, // 禁用对父文件夹的查找
  // 指定脚本的运行环境，一个环境定义了一组预定义的全局变量
  env: {
    browser: true, // 浏览器环境中的全局变量
    es6: true, // 启用除了modules以外的所有ES6特性（该选项会自动设置 ecmaVersion 解析器选项为 6）
    node: true, // Node.js 全局变量和 Node.js 作用域
    mocha: true,
    jest: true,
    jasmine: true,
  },
  // 共享配置，该属性可以是eslint命令，也可以是继承文件的路径，例如 { extends: './public-eslintrc.js' }
  extends: [
    'eslint:recommended',
    // 'react', // from `eslint-config-react'
    'plugin:react/recommended', // from `eslint-plugin-react`
    'plugin:@typescript-eslint/recommended', // from `@typescript-eslint/eslint-plugin`
    // https://github.com/prettier/eslint-config-prettier
    // This plugin just turns off all rules that are unnecessary or might conflict with Prettier.
    'prettier', // Make sure to put it last, so it gets the chance to override other configs.
  ],
  // 'parser': '@babel/eslint-parser', // ESLint 默认使用Espree作为其解析器，项目中一般使用babel-eslint
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    // extraFileExtensions: ['.wc'],
  },
  // (eslint-plugin-前缀可省略)
  plugins: ['import', 'react', 'react-hooks', 'jest', '@typescript-eslint', 'prettier'],
  settings: {
    react: {
      version: 'detect',
    },
  },
}
