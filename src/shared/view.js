import pug from 'pug';
import arc from '@architect/functions';
import kebabCase from 'just-kebab-case';

export function view(filePath, request, context = {}) {
	return pug.renderFile(filePath, {
		canonical: new URL(trimTrailingSlash(request.path), process.env.SITE_URL),
		asset: arc.static,
		basedir: './node_modules/@architect/views',
		isCurrentPath: path => trimTrailingSlash(path) === trimTrailingSlash(request.path),
		kebabCase,
		pretty: true,
		...context,
	});
}

function trimTrailingSlash(path) {
	return path.endsWith('/') ? path.slice(0, -1) : path;
}
