const pages = new Map([
	["about", {
		title: "About",
		published: true,
	}],
	["uses", {
		title: "Uses",
		published: true,
	}],
	["accessibility", {
		title: "Accessibility Statement",
		published: true,
	}],
	["privacy", {
		title: "Privacy",
		published: true,
	}],
]);

export async function GET({view, params}) {
	const page = pages.get(params.page);

	if (!page || !page.published) throw new Response("Not found", {status: 404});

	if (!page.html) page.html = await Deno.readTextFile(`./routes/_pages/${params.page}.html`);

	return view("[page]", {
		title: page.title,
		page,
	});
}

export const pattern = new URLPattern({pathname: "/:page{/}?"})
