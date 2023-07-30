import arc from '@architect/functions';
import { view } from '@architect/shared/view.js';

export const handler = arc.http.async(request => {
	let statusCode = 200;
	const issues = request.session?.issues ?? [];
	const formData = request.session?.formData ?? {};

	if (issues.length > 0) {
		const submissionIssue = issues.some(issue => issue.field === "submission");
		statusCode = submissionIssue ? 500 : 422;
	}

	return {
		statusCode,
		headers: {
			'content-type': 'text/html; charset=utf8',
		},
		body: view('webmention.pug', request, {
			title: 'Webmention',
			formData,
			issues,
		}),
		session: {},
	};
});
