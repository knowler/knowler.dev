import init, { bundleAsync, Features } from "npm:lightningcss-wasm";

await init();

const { code } = await bundleAsync({
	filename: new URL("./assets/main.css", import.meta.resolve("@knowler/web")).pathname,
	include: Features.Nesting,
	exclude: Features.Colors,
});

await Deno.writeFile(
	new URL(
		`./public/main.${Deno.env.get("DENO_DEPLOY_BUILD_ID") ?? "bundled"}.css`,
		import.meta.resolve("@knowler/web"),
	).pathname,
	code,
);
