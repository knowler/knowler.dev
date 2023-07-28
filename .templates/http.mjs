import arc from '@architect/functions';
import { view } from '@architect/shared/view.js';

export const handler = arc.http.async(request => {
	return {
		statusCode: 200,
		headers: {
			'content-type': 'text/html; charset=utf8',
		},
		body: view(/* template file */, request, {
			title: /* title */,
		}),
	};
});
