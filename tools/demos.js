import { render, renderFile } from "pug";
import en from "npm:nanoid-good/locale/en.js";
import nanoidGood from "npm:nanoid-good/index.js";
import { kv } from "./utils/production-kv.js";
import { invariant } from "../utils/invariant.js";

const EDITOR = Deno.env.get("EDITOR");
invariant(EDITOR);

switch (Deno.args[0]) {
	case "delete": deleteDemo(); break;
	case undefined:
	case "new": createDemo(); break;
	case "edit": editDemo(Deno.args[1]); break;
	default: editDemo(Deno.args[0]); break;
}

async function createDemo() {
	const tempDir = await Deno.makeTempDir();

	await Promise.all([
		Deno.create(`${tempDir}/demo.pug`),
		Deno.create(`${tempDir}/demo.css`),
		Deno.create(`${tempDir}/demo.js`),
	]);

	let demo, id, readyToPublish;
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

		const nanoid = nanoidGood.nanoid(en);

		id = await nanoid(7);

		demo = {
			pug: await Deno.readTextFile(`${tempDir}/demo.pug`),
			css: await Deno.readTextFile(`${tempDir}/demo.css`),
			js: await Deno.readTextFile(`${tempDir}/demo.js`),
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

	demo.html = render(demo.pug);

	await kv.set(["demos", id], demo);

	console.log(`https://knowler.dev/demos/${id}`);

	await Deno.remove(tempDir, { recursive: true });
}

async function editDemo(urlOrId) {
	let demoId;

	if (urlOrId) {
		const pattern = new URLPattern({ pathname: "/demos/:demoId" });
		if (URL.canParse(urlOrId)) {
			if (pattern.test(urlOrId)) demoId = pattern.exec(urlOrId).pathname.groups.demoId;
			else throw "Invalid demo URL pattern";
		} else demoId = urlOrId;

		const record = await kv.get(["demos", demoId]);

		if (!record) throw "Can’t find demo";
		const demo = record.value;

		const tempDir = await Deno.makeTempDir();

		await Promise.all([
			Deno.writeTextFile(`${tempDir}/demo.pug`, demo.pug),
			Deno.writeTextFile(`${tempDir}/demo.css`, demo.css),
			Deno.writeTextFile(`${tempDir}/demo.js`, demo.js),
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

			const [pug, css, js] = await Promise.all([
				Deno.readTextFile(`${tempDir}/demo.pug`),
				Deno.readTextFile(`${tempDir}/demo.css`),
				Deno.readTextFile(`${tempDir}/demo.js`),
			]);
			demo.pug = pug; demo.css = css; demo.js = js; 

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

		demo.html = render(demo.pug);

		await kv.set(["demos", demoId], demo);
		const url = `https://knowler.dev/demos/${demoId}`;
		await kv.delete(["kv-httpcache", url]);
		console.log(`Updated: ${url}`);

		await Deno.remove(tempDir, { recursive: true });
	} else {
		console.log("todo: implement fzf list");
	}
}

async function deleteDemo() {
	const [_, urlOrId] = Deno.args;
	let demoId;
	let url;

	if (urlOrId) {
		const pattern = new URLPattern({ pathname: "/demos/:demoId" });
		if (URL.canParse(urlOrId)) {
			if (pattern.test(urlOrId)) demoId = pattern.exec(urlOrId).pathname.groups.demoId;
			else throw "Invalid demo URL pattern";
		} else demoId = urlOrId;

		url ??= `https://knowler.dev/demos/${demoId}`;
		if (confirm(`${url}\nAre you sure you’d like to delete this demo?`)) {
			await kv.delete(["demos", demoId]);
			await kv.delete(["kv-httpcache", url]);
			console.log(`Deleted: ${url}`);
		} else console.log(`${url} will see another day.`)
	} else console.error("No demo URL or ID provided");
}

function createDemoServer(tempDir) {
	const pug = String.raw;
	const TEMPLATE = pug`doctype html
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

	return Deno.serve({
		port: 4000,
		onListen: () => new Deno.Command("open", { args: [ "-g", "http://localhost:4000" ] }).spawn(),
		async handler(request) {
			if (request.headers.get("upgrade") === "websocket") {
				const { socket, response } = Deno.upgradeWebSocket(request);
				let watcher;

				socket.onopen = async () => {
					watcher = Deno.watchFs(tempDir);
					for await (const event of watcher) {
						if (event.kind === "modify") socket.send("reload");
					}
				}

				socket.onclose = () => {
					watcher?.close();
				}

				return response;
			} else {
				const html = render(TEMPLATE, {
					demo: {
						html: renderFile(`${tempDir}/demo.pug`),
						css: await Deno.readTextFile(`${tempDir}/demo.css`),
						js: await Deno.readTextFile(`${tempDir}/demo.js`),
					},
				});
				return new Response(html, {
					headers: {
						"content-type": "text/html; charset=utf-8"
					},
				});
			}
		},
	});
}
