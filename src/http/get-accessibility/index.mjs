import arc from '@architect/functions';
import { view } from '@architect/shared/view/index.js';

export const handler = arc.http.async(request => {
	return {
		statusCode: 200,
		headers: {
			'content-type': 'text/html; charset=utf-8',
		},
		body: view('accessibility.pug', request, {
			title: 'Accessibility Statement',
		}),
	};
});
