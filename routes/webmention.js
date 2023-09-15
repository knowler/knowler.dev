export function GET({ view }) {
	return view(
		"webmention",
		{
			title: "Webmention",
			issues: [],
			formData: {},
		},
	);
}

export async function POST({ request }) {
}

export const pattern = new URLPattern({ pathname: "/webmention" });
