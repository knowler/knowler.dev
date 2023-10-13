const pages = new Map([
	["home", {
		title: "Welcome",
		published: true,
	}],
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

export async function getPage(slug) {
	const page = pages.get(slug);

	if (!page || !page.published) throw "page not found";

	page.html = await Deno.readTextFile(`./routes/_pages/${slug}.html`);

	return page;
}

export async function getPages() {
	return pages;
}
