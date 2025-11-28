import { render } from "pug";
import { createDemoServer } from "../server.js";
import * as api from "../request.js";

const EDITOR = Deno.env.get("EDITOR");
const PRODUCTION_URL = Deno.env.get("PRODUCTION_URL");

export async function createDemo() {
	const tempDir = await Deno.makeTempDir();

	await Promise.all([
		Deno.create(`${tempDir}/demo.pug`),
		Deno.writeTextFile(`${tempDir}/demo.css`, ":root {\n\tcolor-scheme: dark light;\n}"),
		Deno.create(`${tempDir}/demo.js`),
		Deno.writeTextFile(`${tempDir}/demo.json`, "{}"),
		Deno.writeTextFile(`${tempDir}/head.html`),
	]);

	let demo, readyToPublish;
	while (!readyToPublish) {
		const server = createDemoServer(tempDir);
		const editor = new Deno.Command(EDITOR, { args: [ `${tempDir}/demo.pug` ], cwd: tempDir }).spawn();
		const editorOutput = await editor.output();
		await server.shutdown();

		if (!editorOutput.success) {
			console.error(new TextDecoder().decode(editorOutput.stderr));
			console.log("files at:", tempDir);
			Deno.exit();
		}

		demo = {
			pug: await Deno.readTextFile(`${tempDir}/demo.pug`),
			css: await Deno.readTextFile(`${tempDir}/demo.css`),
			js: await Deno.readTextFile(`${tempDir}/demo.js`),
			head: await Deno.readTextFile(`${tempDir}/head.html`)
		};

		console.log(demo);
		readyToPublish = confirm("Would you like to publish this?")
		if (!readyToPublish) {
			if (!confirm("Would you like to keep editing this? (No, will discard and DELETE the demo files)")) {
				Deno.remove(tempDir, { recursive: true });
				Deno.exit();
			}
		}
	}

	console.log("What should we call this?");
	demo.title = prompt("Title:", demo.title);
	console.log("What does it do?");
	demo.description = prompt("Description:", demo.description);

	demo.html = render(demo.pug, { pretty: true });

	const response = await api.post("create", demo);

	if (response.ok) {
		const { id } = await response.json();
		await Deno.remove(tempDir, { recursive: true });
		const url = `${PRODUCTION_URL}/demos/${id}`;
		console.log(url);
		new Deno.Command("open", { args: [ url ] }).spawn();
	} else {
		console.log("Something went wrong. See files at: ", tempDir);
	}
}
