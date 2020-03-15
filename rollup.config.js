import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

// https://www.npmjs.com/package/rollup-plugin-copy

export default {
  input: 'index.ts',
  external: [ 'crypto' ],
  output: {
      file: 'dist/bundle.js',
      format: 'umd'
  },
  plugins: [
    typescript(),     
    resolve({ browser: true, preferBuiltins: true }),
    commonjs()
  ]
}