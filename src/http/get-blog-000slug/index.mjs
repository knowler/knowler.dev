import arc from '@architect/functions';
import { view } from '@architect/shared/view.js';
import { posts } from '@architect/shared/blog-posts.js';

export const handler = arc.http.async(request => {
	const post = posts.get(request.pathParameters.slug);

	return {
		statusCode: 200,
		headers: {
			'content-type': 'text/html; charset=utf8',
		},
		body: view('blog-post.pug', request, {
			title: post.title,
			description: post.description,
		}),
	};
});
