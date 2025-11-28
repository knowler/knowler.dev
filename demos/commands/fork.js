import { render } from "pug";
import { createDemoServer } from "../server.js";
import * as api from "../request.js";

const EDITOR = Deno.env.get("EDITOR");
const PRODUCTION_URL = Deno.env.get("PRODUCTION_URL");

export async function forkDemo(urlOrId) {
	// Figure out the ID
	// Get the existing demo
	// Start up an editing environment with that content
	// Work as if we’re saving a new one.
	let demoId;

	if (urlOrId) {
		const pattern = new URLPattern({ pathname: "/demos/:demoId" });
		if (URL.canParse(urlOrId)) {
			if (pattern.test(urlOrId)) demoId = pattern.exec(urlOrId).pathname.groups.demoId;
			else throw "Invalid demo URL pattern";
		} else demoId = urlOrId;

		let response = await api.get(demoId);

		if (!response.ok) throw "Can’t find demo to fork";
		const demo = await response.json();

		const tempDir = await Deno.makeTempDir();

		await Promise.all([
			Deno.writeTextFile(`${tempDir}/demo.pug`, demo.pug),
			Deno.writeTextFile(`${tempDir}/demo.css`, demo.css),
			Deno.writeTextFile(`${tempDir}/demo.js`, demo.js),
			Deno.writeTextFile(`${tempDir}/head.html`, demo.head),
			Deno.writeTextFile(`${tempDir}/demo.json`, JSON.stringify({ "title": demo.title, "description": demo.description }, null, 2)),
		]);

		let readyToSave;
		while (!readyToSave) {
			const server = createDemoServer(tempDir);
			const editor = new Deno.Command(EDITOR, { args: [ `${tempDir}/demo.pug` ], cwd: tempDir }).spawn();
			const editorOutput = await editor.output();
			await server.shutdown();

			if (!editorOutput.success) {
				console.error(new TextDecoder().decode(editorOutput.stderr));
				console.log("files at:", tempDir);
				Deno.exit();
			}

			const [pug, css, js, head, meta] = await Promise.all([
				Deno.readTextFile(`${tempDir}/demo.pug`),
				Deno.readTextFile(`${tempDir}/demo.css`),
				Deno.readTextFile(`${tempDir}/demo.js`),
				Deno.readTextFile(`${tempDir}/head.html`, demo.head),
				Deno.readTextFile(`${tempDir}/demo.json`).then(text => JSON.parse(text)),
			]);
			demo.pug = pug; demo.css = css; demo.js = js; demo.title = meta.title; demo.description = meta.description; demo.head = head;

			console.log(demo);
			readyToSave = confirm("Ready to save and publish these changes?");
			if (!readyToSave) {
				if (!confirm("Keep editing? (No will discard the changes.)")) {
					Deno.remove(tempDir, { recursive: true });
					Deno.exit();
				}
			}
		}

		console.log("Confirming some details");
		demo.title = prompt("Title:", demo.title);
		demo.description = prompt("Description:", demo.description);

		demo.html = render(demo.pug, { pretty: true });

		response = await api.post("create", demo);

		if (response.ok) {
			const { id } = await response.json();
			const url = `${PRODUCTION_URL}/demos/${id}`;
			console.log(`Created fork: ${url}`);
			await Deno.remove(tempDir, { recursive: true });
		} else {
			console.error(`Forking failed. Files at ${tempDir}.`);
		}
	} else {
		console.log("Nothing to fork");
	}
}
