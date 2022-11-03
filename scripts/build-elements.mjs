import { build } from 'esbuild';

const __DEV__ = process.env.NODE_ENV === "development";

await build({
	bundle: true,
	format: 'esm',
	sourcemap: __DEV__,
	entryPoints: [
		'elements/microblog-editor.mjs',
		'elements/markdown-editor.mjs',
	],
	outdir: 'public/elements',
	minify: !__DEV__,
	watch: __DEV__,
});
