import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

export default [
  // CommonJS (for Node) and ES module (for bundlers) build
  {
    input: 'src/index.ts',
    external: ['create-hmac', 'qs'],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ],
    plugins: [
      typescript({
        exclude: ['node_modules/**']
      })
    ]
  },

  // browser-friendly UMD build
  {
    input: 'src/index.ts',
    output: {
      name: 'FQB',
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [
      resolve(),
      typescript({
        exclude: ['node_modules/**']
      }),
      commonjs()
    ]
  },

  // browser-friendly UMD build for production
  {
    input: 'src/index.ts',
    output: {
      name: 'FQB',
      file: 'dist/fqb.min.js',
      format: 'umd'
    },
    plugins: [
      resolve(),
      typescript({
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
