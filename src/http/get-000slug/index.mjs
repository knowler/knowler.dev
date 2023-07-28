import arc from '@architect/functions';
import { renderFile } from '@architect/shared/pug.mjs';

export const handler = arc.http.async(request => {
	const { pathParameters } = request;
	const { slug } = pathParameters;

	const page = pages.get(slug);

	if (!page) return { statusCode: 404 }

  return {
    statusCode: 200,
    headers: {
      'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
      'content-type': 'text/html; charset=utf8'
    },
		body: renderFile('page.pug', {
			title: page.title,
		}),
  }
});
