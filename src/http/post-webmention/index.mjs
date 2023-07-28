import arc from '@architect/functions';

export const handler = arc.http.async(request => {
	return {
		statusCode: 303,
		location: '/webmention',
		session: {
			issues: [
				{
					field: 'source',
					message: 'Source URL is required',
				},
			],
		},
	};
});
