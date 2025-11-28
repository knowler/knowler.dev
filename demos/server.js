import { renderFile } from "pug";

const TEMPLATE_URL = new URL("./template.pug", import.meta.resolve("@knowler/demos"));

export function createDemoServer(tempDir) {
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
				const html = renderFile(TEMPLATE_URL.pathname, {
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

