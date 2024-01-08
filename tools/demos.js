import { render, renderFile } from "pug";
import en from "npm:nanoid-good/locale/en.js";
import nanoidGood from "npm:nanoid-good/index.js";
import { kv } from "./utils/production-kv.js";

import { invariant } from "../utils/invariant.js";

const EDITOR = Deno.env.get("EDITOR");
invariant(EDITOR);

const tempDir = await Deno.makeTempDir();
const documentPath = `${tempDir}/demo.pug`;

const [document, stylesheet, script] = await Promise.all(
	["demo.pug", "demo.css", "demo.js"].map(filename => Deno.create(`${tempDir}/${filename}`))
);

const pug = String.raw;
const template = pug`doctype html
html(lang="en-ca")
	head
		meta(charset="utf-8")
		meta(name="viewport" content="width=device-width, initial-scale=1")
		style!= demo.css
		script(type="module")!= demo.js
	body
		| !{demo.html}
		script.
			const ws = new WebSocket("ws://localhost:4000");
			ws.onmessage = e => {
				if (e.data === "reload") location.reload();
			}
`;

const server = Deno.serve({
	port: 4000,
	onListen: () => new Deno.Command("open", { args: [ "http://localhost:4000" ] }).spawn(),
}, async request => {
	if (request.headers.get("upgrade") === "websocket") {
		const { socket, response } = Deno.upgradeWebSocket(request);

		let watcher;

		socket.onopen = async () => {
			watcher = Deno.watchFs(tempDir);
			for await (const event of watcher) {
				if (event.kind === "modify") socket.send("reload");
			}
		};

		socket.onclose = () => {
			watcher.close();
		}

		return response;
	}

	const html = render(template, {
		demo: {
			html: renderFile(`${tempDir}/demo.pug`),
			css: await Deno.readTextFile(`${tempDir}/demo.css`),
			js: await Deno.readTextFile(`${tempDir}/demo.js`),
		},
	});
	return new Response(html, {
		headers: {
			"content-type": "text/html; charset=utf-8",
		},
	});
});


const editor = new Deno.Command(EDITOR, { args: [ documentPath ], cwd: tempDir }).spawn();

const editorOutput = await editor.output();
await server.shutdown();

if (!editorOutput.success) {
	console.error(new TextDecoder().decode(editorOutput.stderr));
	console.log("files at:", tempDir);
	Deno.exit();
}

const nanoid = nanoidGood.nanoid(en);

const id = await nanoid(7);

const demo = {
	pug: await Deno.readTextFile(`${tempDir}/demo.pug`),
	css: await Deno.readTextFile(`${tempDir}/demo.css`),
	js: await Deno.readTextFile(`${tempDir}/demo.js`),
};

demo.html = render(demo.pug);

await kv.set(["demos", id], demo);

console.log(`https://knowler.dev/demos/${id}`);

await Deno.remove(tempDir, { recursive: true });
