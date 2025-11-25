import { render, renderFile } from "pug";
import { invariant } from "../utils/invariant.js";

const EDITOR = Deno.env.get("EDITOR");
invariant(EDITOR);

const PRODUCTION_URL = Deno.env.get("PRODUCTION_URL");
invariant(PRODUCTION_URL);

const MIGRATION_PATH = Deno.env.get("MIGRATION_PATH");
invariant(MIGRATION_PATH);

const MIGRATION_TOKEN = Deno.env.get("MIGRATION_TOKEN");
invariant(MIGRATION_TOKEN);

const ENDPOINT = new URL(
	`${MIGRATION_PATH}/demos`,
	PRODUCTION_URL,
);

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

	const response = await fetch(`${ENDPOINT}/create`, {
		method: "POST",
		body: JSON.stringify(demo),
		headers: {
			"content-type": "application/json",
			authorization: `Bearer ${MIGRATION_TOKEN}`,
		},
	});

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

async function editDemo(urlOrId) {
	let demoId;

	if (urlOrId) {
		const pattern = new URLPattern({ pathname: "/demos/:demoId" });
		if (URL.canParse(urlOrId)) {
			if (pattern.test(urlOrId)) demoId = pattern.exec(urlOrId).pathname.groups.demoId;
			else throw "Invalid demo URL pattern";
		} else demoId = urlOrId;

		let response = await fetch(`${ENDPOINT}/${demoId}`, {
			method: "GET",
			headers: {
				authorization: `Bearer ${MIGRATION_TOKEN}`,
			},
		});

		if (!response.ok) throw "Can’t find demo";
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
				Deno.readTextFile(`${tempDir}/head.html`),
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

		response = await fetch(`${ENDPOINT}/${demoId}/update`, {
			method: "POST",
			body: JSON.stringify(demo),
			headers: {
				"content-type": "application/json",
				authorization: `Bearer ${MIGRATION_TOKEN}`,
			},
		});

		if (response.ok) {
			const url = `${PRODUCTION_URL}/demos/${demoId}`;
			console.log(`Updated: ${url}`);
			await Deno.remove(tempDir, { recursive: true });
		} else {
			console.error(`Error updating: ${url}. Files at: ${tempDir}`);
		}
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

		url ??= `${PRODUCTION_URL}/demos/${demoId}`;
		if (confirm(`${url}\nAre you sure you’d like to delete this demo?`)) {

			const response = await fetch(`${ENDPOINT}/${demoId}/delete`, {
				method: "POST",
				headers: {
					authorization: `Bearer ${MIGRATION_TOKEN}`,
				},
			});

			if (response.ok) console.log(`Deleted: ${url}`);
			else console.error(`Issue deleting: ${url}`);
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
		| !{demo.head}
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
						head: await Deno.readTextFile(`${tempDir}/head.html`),
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

	if (urlOrId) {
		const pattern = new URLPattern({ pathname: "/demos/:demoId" });
		if (URL.canParse(urlOrId)) {
			if (pattern.test(urlOrId)) demoId = pattern.exec(urlOrId).pathname.groups.demoId;
			else throw "Invalid demo URL pattern";
		} else demoId = urlOrId;

		let response = await fetch(`${ENDPOINT}/${demoId}`, {
			method: "GET",
			headers: {
				authorization: `Bearer ${MIGRATION_TOKEN}`,
			},
		});

		if (!response.ok) throw "Can’t find demo to fork";
		const demo = await response.json();

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

		response = await fetch(`${ENDPOINT}/create`, {
			method: "POST",
			body: JSON.stringify(demo),
			headers: {
				"content-type": "application/json",
				authorization: `Bearer ${MIGRATION_TOKEN}`,
			},
		});

		if (response.ok) {
			const { id } = await response.json();
			const url = `https://knowler.dev/demos/${id}`;
			console.log(`Created fork: ${url}`);
			await Deno.remove(tempDir, { recursive: true });
		} else {
			console.error(`Forking failed. Files at ${tempDir}.`);
		}
	} else {
		console.log("Nothing to fork");
	}
}
