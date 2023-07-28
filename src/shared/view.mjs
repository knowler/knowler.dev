import pug from 'pug';
import arc from '@architect/functions';
import kebabCase from 'just-kebab-case';

export function view(filePath, request, context = {}) {
	return pug.renderFile(filePath, {
		canonical: new URL(request.path, process.env.SITE_URL),
		asset: arc.static,
		basedir: './node_modules/@architect/views',
		isCurrentPath(path) {
				const normalizedPath = path.endsWith('/') ? path : `${path}/`;
				const normalizedRequestPath = request.path.endsWith('/') ? request.path : `${request.path}/`;
				return normalizedPath === normalizedRequestPath;
		},
		kebabCase,
		pretty: true,
		...context,
	});
}
