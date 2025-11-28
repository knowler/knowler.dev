import { createDemoServer } from "../server.js";
import * as api from "../request.js";

const EDITOR = Deno.env.get("EDITOR");
const PRODUCTION_URL = Deno.env.get("PRODUCTION_URL");

export async function deleteDemo(urlOrId) {
	let demoId;
	let url;

	if (urlOrId) {
		const pattern = new URLPattern({ pathname: "/demos/:demoId" });
		if (URL.canParse(urlOrId)) {
			if (pattern.test(urlOrId)) demoId = pattern.exec(urlOrId).pathname.groups.demoId;
			else throw "Invalid demo URL pattern";
		} else demoId = urlOrId;

		url ??= `${PRODUCTION_URL}/demos/${demoId}`;
		if (confirm(`${url}\nAre you sure you’d like to delete this demo?`)) {

			const response = await api.post(`${demoId}/delete`);

			if (response.ok) console.log(`Deleted: ${url}`);
			else console.error(`Issue deleting: ${url}`);
		} else console.log(`${url} will see another day.`)
	} else console.error("No demo URL or ID provided");
}

