const LOGIN_PATH = Deno.env.get('LOGIN_PATH');

export function GET({ view }) {
	return view("login", {
		title: "Sign In",
		issues: [],
		formData: {},
	});
}

export async function POST({ request }) {
	const formData = await request.formData();

	console.log(Array.from(formData));

	return new Response(null, {
		status: 303,
		headers: {
			location: `/${LOGIN_PATH}`,
		},
	});
}

export const pattern = new URLPattern({ pathname: `/${LOGIN_PATH}{/}?` });
