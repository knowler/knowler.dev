import arc from '@architect/functions';

const webmentionFormURL = new URL('/webmention', process.env.SITE_URL);

export const handler = arc.http.async(async request => {
	const fromWebmentionForm = request.headers.referer === webmentionFormURL.toString();

	const response = {};
	if (fromWebmentionForm) response.location = webmentionFormURL.pathname;

	const { source, target, robotName } = request.body;

	// If it’s coming from the /webmention form and it’s filled in the honeypot…
	if (fromWebmentionForm && robotName !== '') return { statusCode: 400 };

	const issues = [];
	const payload = {};

	// Check if source has been set
	if (!source) issues.push({field: 'source', message: 'Source URL is required'});
	// Check if source is a URL
	else {
		try {
			payload.source = new URL(source);
		} catch (error) {
			if (error instanceof TypeError) issues.push({field: 'source', message: 'Source URL is invalid'});
			else throw error;
		}
	}

	// Check if source has been set
	if (!target) issues.push({field: 'target', message: 'Target URL is required'});
	// Check if source is a URL
	else {
		try {
			payload.target = new URL(target);
		} catch (error) {
			if (error instanceof TypeError) issues.push({field: 'target', message: 'Target URL is invalid'});
			else throw error;
		}
	}

	// Check if the source and target are the same
	if (source.toLowerCase() === target.toLowerCase()) {
		issues.push(
			{field: 'source', message: 'Source URL must not match Target URL'},
			{field: 'target', message: 'Target URL must not match Source URL'},
		);
	}

	// Validation failed
	if (issues.length > 0) {
		response.statusCode = fromWebmentionForm ? 303 : 422;
		response.session = {
			issues,
			// TODO: need to sanitize this!
			formData: { source, target },
		};

		return response;
	}

	try {
		// Create a job to process the webmention source’s content later…
		await arc.events.publish({
			name: 'incoming-webmention',
			payload,
		});
	} catch (error) {
		// This is a server error…
		console.error('Failed to create job to process webmention', error);

		response.statusCode = fromWebmentionForm ? 303 : 500;
		response.session = {
			formData: { source, target },
			issues: [
				{
					field: 'submission',
					message: 'There was an issue with creating a job to process this webmention.',
				},
			],
		};

		return response;
	}

	// If we had a reference for the job, we could return a 201 with a
	// URL to check the status, but 202 is fine for now.
	response.statusCode = fromWebmentionForm ? 303 : 202;

	return response;
});
