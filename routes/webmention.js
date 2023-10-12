import kv from "~/kv.js";

// TODO: implement UI for webmentions
//export function GET({ view }) {
//	return view(
//		"webmention",
//		{
//			title: "Webmention",
//			issues: [],
//			formData: {},
//		},
//	);
//}

export async function POST({ request }) {
	const formData = await request.formData();

	// TODO: validate request

	kv.enqueue({
		action: "process-webmention",
		payload: {
			target: formData.get("target"),
			source: formData.get("source"),
		},
	});

	return new Response(null, { status: 202 });
}

export const pattern = new URLPattern({ pathname: "/webmention" });
