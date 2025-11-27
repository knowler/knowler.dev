import { bundleAsync as bundle, browserslistToTargets, Features } from "lightningcss"
import browserslist from "browserslist";

const DENO_DEPLOY_BUILD_ID = Deno.env.get("DENO_DEPLOY_BUILD_ID");

let { code } = await bundle({
	filename: "./src/main.css",
	targets: browserslistToTargets(browserslist("baseline widely available")),
	include: Features.Nesting,
	exclude: Features.Colors,
});

await Deno.writeFile(`./assets/main.${DENO_DEPLOY_BUILD_ID}.css`, code);
