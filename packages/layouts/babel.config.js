export default {
  presets: [
    '@babel/preset-env',
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [
    // NOTE! with style: true css source files are imported and optimizations can be done during compilation time.
    // With style: "css", pre bundled css files are imported as they are.
    // style: true can reduce the bundle size significantly, depending on your usage of the library.
    // Options can't be an array in babel@7+, but you can add plugins with name to support multiple dependencies.
    ['import', { libraryDirectory: 'es', libraryName: 'ink', style: true }, 'ink'],
    // ["import", { "libraryName": "lodash", "camel2DashComponentName": false }, "lodash"]
  ],
}
