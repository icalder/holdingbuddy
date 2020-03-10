import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
//import { uglify } from '@rollup/plugin-uglify';

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
    //uglify()
  ]
}