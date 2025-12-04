import init, { bundleAsync, Features } from "npm:lightningcss-wasm";
import { crypto } from "jsr:@std/crypto";

await init();

const { code } = await bundleAsync({
	filename: new URL("./assets/main.css", import.meta.resolve("@knowler/web")).pathname,
	include: Features.Nesting,
	exclude: Features.Colors,
});

const fingerprint = new Uint8Array(await crypto.subtle.digest("BLAKE2B", data)).toHex().substring(0, 8);

await Deno.writeFile(
	new URL(
		`./public/main.${hash}.css`,
		import.meta.resolve("@knowler/web"),
	).pathname,
	code,
);

const assets = {
	"/main.css": `/main.${hash}.css`,
};

await Deno.writeTextFile("./web/assets.json", JSON.stringify(assets));

console.log(assets);
