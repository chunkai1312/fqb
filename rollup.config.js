import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

export default [
  // CommonJS (for Node) and ES module (for bundlers) build
  {
    input: 'src/index.js',
    external: ['create-hmac', 'qs'],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: [
      babel({
        exclude: ['node_modules/**']
      })
    ]
  },

  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      name: 'FQB',
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [
      resolve(),
      babel({
        exclude: ['node_modules/**']
      }),
      commonjs()
    ]
  },

  // browser-friendly UMD build for production
  {
    input: 'src/index.js',
    output: {
      name: 'FQB',
      file: 'dist/fqb.min.js',
      format: 'umd'
    },
    plugins: [
      resolve(),
      babel({
        exclude: ['node_modules/**']
      }),
      commonjs(),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false
        }
      })
    ]
  }
]
