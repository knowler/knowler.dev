import arc from '@architect/functions';
import asap from '@architect/asap';
import { view } from '@architect/shared/view.js';

if (!globalThis.URLPattern) await import("urlpattern-polyfill");

const staticProxy = asap({
  passthru: true,
  spa: false
});

function notFound(request) {
	return {
		statusCode: 404,
		headers: {
			'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
			'content-type': 'text/html; charset=utf8',
		},
		body: view('404.pug', request, {
			title: 'Not Found',
		}),
	};
}

const pages = new Map([
	['about', {
		title: 'About',
		template: 'about.pug',
	}],
	['accessibility', {
		title: 'Accessibility Statement',
		template: 'accessibility.pug',
	}],
	['privacy', {
		title: 'Privacy Policy',
		template: 'privacy.pug',
	}],
]);

const pagePattern = new URLPattern({ pathname: '/:slug{/}?' });
function handlePage(request) {
	const matches = pagePattern.exec({ pathname: request.path });

	if (matches) {
		const { slug } = pagePattern.exec({ pathname: request.path }).pathname.groups;

		const page = pages.get(slug);

		if (page) {
			return {
				statusCode: 200,
				headers: {
					'content-type': 'text/html; charset=utf8',
				},
				body: view(page.template, request, {
					title: page.title,
				}),
			};
		}
	}
}

export const handler = arc.http.async(staticProxy, handlePage, notFound);
