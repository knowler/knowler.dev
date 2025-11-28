const MIGRATION_TOKEN = Deno.env.get("MIGRATION_TOKEN");

export async function get(path) {
	const ENDPOINT = Deno.env.get("ENDPOINT");
	const url = new URL(path, `${ENDPOINT}/`);

	return fetch(url, {
		method: "GET",
		headers: {
			authorization: `Bearer ${MIGRATION_TOKEN}`,
		},
	});
}

export async function post(path, body) {
	const ENDPOINT = Deno.env.get("ENDPOINT");
	const url = new URL(path, `${ENDPOINT}/`);

	const requestOptions = {
		method: "POST",
		headers: {
			authorization: `Bearer ${MIGRATION_TOKEN}`,
		},
	}

	if (body) {
		requestOptions.headers["content-type"] = "application/json";
		requestOptions.body = JSON.stringify(body);
	}

	return fetch(url, requestOptions);
}
