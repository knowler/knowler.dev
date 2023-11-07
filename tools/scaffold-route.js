const [routeName, title] = Deno.args;

await Deno.writeTextFile(`./routes/${routeName}.js`, `
export async function get(c) {
	return c.render("${routeName}", {
		title: ${title},
	});
}
`.trim());
await Deno.writeTextFile(`./routes/${routeName}.pug`, `
extends /_layouts/public

block content
	h1= title
`.trim());
