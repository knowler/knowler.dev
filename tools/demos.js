import { render, renderFile } from "pug";
import en from "npm:nanoid-good/locale/en.js";
import nanoidGood from "npm:nanoid-good/index.js";
import { invariant } from "../utils/invariant.js";

const EDITOR = Deno.env.get("EDITOR");
invariant(EDITOR);

switch (Deno.args[0]) {
	case undefined:
	case "new": createDemo(); break;

	case "edit": editDemo(Deno.args[1]); break;

	case "fork": forkDemo(Deno.args[1]); break;

	case "delete": deleteDemo(); break;

	default: editDemo(Deno.args[0]); break;
}

async function createDemo() {
	const tempDir = await Deno.makeTempDir();

	await Promise.all([
		Deno.create(`${tempDir}/demo.pug`),
		Deno.writeTextFile(`${tempDir}/demo.css`, ":root {\n\tcolor-scheme: dark light;\n}"),
		Deno.create(`${tempDir}/demo.js`),
		Deno.writeTextFile(`${tempDir}/demo.json`, "{}"),
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

	demo.html = render(demo.pug, { pretty: true });

	const { kv } = await import("./utils/production-kv.js");

	await kv.set(["demos", id], demo);

	await Deno.remove(tempDir, { recursive: true });
	const url = `https://knowler.dev/demos/${id}`;
	console.log(url);
	new Deno.Command("open", { args: [ url ] }).spawn();
}

async function editDemo(urlOrId) {
	let demoId;

	const { kv } = await import("./utils/production-kv.js");

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

			const [pug, css, js, meta] = await Promise.all([
				Deno.readTextFile(`${tempDir}/demo.pug`),
				Deno.readTextFile(`${tempDir}/demo.css`),
				Deno.readTextFile(`${tempDir}/demo.js`),
				Deno.readTextFile(`${tempDir}/demo.json`).then(text => JSON.parse(text)),
			]);
			demo.pug = pug; demo.css = css; demo.js = js; demo.title = meta.title; demo.description = meta.description;

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

		await kv.set(["demos", demoId], demo);
		const url = `https://knowler.dev/demos/${demoId}`;

		await bustDemosCache();

		console.log(`Updated: ${url}`);

		await Deno.remove(tempDir, { recursive: true });
	} else {
		console.log("todo: implement fzf list");
	}
}

async function deleteDemo() {
	const { kv } = await import("./utils/production-kv.js");

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

			await bustDemosCache();

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
		title= title
		style!= demo.css
		script(type="module")!= demo.js
	body
		| !{demo.html}
		script (new WebSocket("ws://localhost:4000")).onmessage = e => e.data === "reload" && location.reload();
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
				const meta = JSON.parse(await Deno.readTextFile(`${tempDir}/demo.json`));
				const html = render(TEMPLATE, {
					title: meta?.json ?? "Untitled Demo",
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

async function forkDemo(urlOrId) {
	// Figure out the ID
	// Get the existing demo
	// Start up an editing environment with that content
	// Work as if we’re saving a new one.
	let demoId;

	const { kv } = await import("./utils/production-kv.js");

	if (urlOrId) {
		const pattern = new URLPattern({ pathname: "/demos/:demoId" });
		if (URL.canParse(urlOrId)) {
			if (pattern.test(urlOrId)) demoId = pattern.exec(urlOrId).pathname.groups.demoId;
			else throw "Invalid demo URL pattern";
		} else demoId = urlOrId;

		const record = await kv.get(["demos", demoId]);

		if (!record) throw "Can’t find demo to fork";
		const demo = record.value;

		const tempDir = await Deno.makeTempDir();

		await Promise.all([
			Deno.writeTextFile(`${tempDir}/demo.pug`, demo.pug),
			Deno.writeTextFile(`${tempDir}/demo.css`, demo.css),
			Deno.writeTextFile(`${tempDir}/demo.js`, demo.js),
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

			const [pug, css, js, meta] = await Promise.all([
				Deno.readTextFile(`${tempDir}/demo.pug`),
				Deno.readTextFile(`${tempDir}/demo.css`),
				Deno.readTextFile(`${tempDir}/demo.js`),
				Deno.readTextFile(`${tempDir}/demo.json`).then(text => JSON.parse(text)),
			]);
			demo.pug = pug; demo.css = css; demo.js = js; demo.title = meta.title; demo.description = meta.description;

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

		const nanoid = nanoidGood.nanoid(en);
		const id = await nanoid(7);

		await kv.set(["demos", id], demo);
		const url = `https://knowler.dev/demos/${id}`;
		console.log(`Created fork: ${url}`);

		await Deno.remove(tempDir, { recursive: true });
	} else {
		console.log("Nothing to fork");
	}
}

async function bustDemosCache() {
	const { kv } = await import("./utils/production-kv.js");
	const { value: cache_versions } = await kv.get(["cache_versions"]);
	await kv.set(["cache_versions"], {
		...cache_versions,
		demos_version: Date.now(),
	});
}
