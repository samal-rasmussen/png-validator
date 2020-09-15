import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { terser } from "rollup-plugin-terser";
import del from 'rollup-plugin-delete';

export default {
	input: 'src/index.ts', // our source file
	output: [
		{
			file: pkg.main,
			format: 'cjs',
		},
		{
			file: pkg.module,
			format: 'es',
		},
		{
			file: pkg.browser,
			format: 'iife',
			name: 'PngValidator',
		},
	],
	plugins: [
		typescript({
			typescript: require('typescript'),
		}),
		terser(),
		del({ targets: 'dist/*' }),
	],
};
