import arc from '@architect/functions';
import asap from '@architect/asap';
import { view } from '@architect/shared/view/index.js';

const staticProxy = asap({
  passthru: true,
  spa: false
});

function notFound(request) {
	return {
		statusCode: 404,
		headers: {
			'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
			'content-type': 'text/html; charset=utf8'
		},
		body: view('404.pug', request),
	};
}


export const handler = arc.http.async(staticProxy, notFound);
