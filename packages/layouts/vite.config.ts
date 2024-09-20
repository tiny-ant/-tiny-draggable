import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
import react from '@vitejs/plugin-react'
import vitePluginImp from 'vite-plugin-imp'
// import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    // jsxFactory: 'h',
    // jsxFragment: 'Fragment',
    // jsxInject: 'import React from \'react\'',
  },
  plugins: [
    react({
      // babel: {
      //   configFile: false,
      //   plugins: [['import', { libraryDirectory: 'es', libraryName: 'ink', style: true }, 'ink']],
      // },
    }),
    vitePluginImp({
      optimize: true,
      libList: [
        {
          // libDirectory: 'es', // default 'es'
          libName: 'ink',
          style: (name) => `ink/es/${name}/style/index.js`,
          camel2DashComponentName: false,
          // replaceOldImport: true,
        },
      ],
    }),
    // 兼容低版本chrome
    // legacy({
    //   // The default value, 'defaults', is what is recommended by Browserslist.
    //   // see https://github.com/browserslist/browserslist#best-practices
    //   targets: ['defaults', 'not IE 11'], // passed to @babel/preset-env
    // }),
    // legacy({
    //   targets: ['Chrome 63'],
    //   additionalLegacyPolyfills: [
    //     'regenerator-runtime/runtime',
    //     '@babel/plugin-proposal-optional-chaining',
    //   ],
    //   modernPolyfills: true,
    // }),
  ],
  resolve: {
    alias: [{ find: /^~\/?/, replacement: '/src/' }],
    // alias: {
    //   '~': '/src/',
    // },
  },
  json: {
    stringify: true,
  },
})
