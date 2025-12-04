import init, { bundleAsync, Features } from "npm:lightningcss-wasm";
import { crypto } from "jsr:@std/crypto";
import * as path from "jsr:@std/path";

await init();

const webRoot = import.meta.resolve("@knowler/web");

const assets = {};

const { code } = await bundleAsync({
	filename: webPath("./assets/main.css"),
	include: Features.Nesting,
	exclude: Features.Colors,
});

const cssHash = await hash(code);

await Deno.writeFile(
	webPath(`./public/main.${cssHash}.css`),
	code,
);

assets["/main.css"] = `/main.${cssHash}.css`;

for (const filePath of ["favicon.ico", "favicon.png", "banners/anti-javascript-javascript-club-member-88x31.webp"]) {
	const sourcePath = webPath(`./assets/${filePath}`);

	const parsed = path.parse(filePath);

	const fingerprint = await hash(
		await Deno.readFile(sourcePath),
	);

	const fingerPrintedFilePath = path.join(parsed.dir, `${parsed.name}.${fingerprint}${parsed.ext}`);

	await Deno.copyFile(
		sourcePath,
		webPath(`./public/${fingerPrintedFilePath}`),
	);

	assets[`/${filePath}`] = `/${fingerPrintedFilePath}`;
}

await Deno.writeTextFile("./web/assets.json", JSON.stringify(assets));

console.log(assets);

async function hash(data) {
	return new Uint8Array(await crypto.subtle.digest("BLAKE2B", data)).toHex().substring(0, 8);
}

function webPath(path) {
	return new URL(path, import.meta.resolve("@knowler/web")).pathname;
}
