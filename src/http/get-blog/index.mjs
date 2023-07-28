import arc from '@architect/functions';
import { view } from '@architect/shared/view.js';
import { posts } from '@architect/shared/blog-posts.js';

export const handler = arc.http.async(request => {
	return {
		statusCode: 200,
		headers: {
			'content-type': 'text/html; charset=utf8',
		},
		body: view('blog-index.pug', request, {
			title: 'Blog',
			posts: Object.fromEntries(Array.from(posts).reverse()),
		}),
	};
});
