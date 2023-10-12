import { Hono } from "hono";
import { logger, serveStatic } from "hono/middleware";
import { renderFile } from "pug";
import kebabCase from "case/paramCase";
import { processWebmention } from "~/jobs/process-webmention.js";
import kv from "~/kv.js";
import { getPage } from "~/models/pages.js";
import { getPost, getPosts } from "~/models/posts.js";
import { Feed } from "feed";

kv.listenQueue(async (message) => {
	switch (message.action) {
		case "process-webmention": {
			await processWebmention(message.payload);
			break;
		}
		case undefined:
			throw "undefined action";
		default:
			throw `unknown action: ${message.action}`;
	}
});

const app = new Hono();

app.use("*", async (c, next) => {
	c.setRenderer((template, data = {}) =>
		c.html(
			renderFile(
				`./routes/${template}.pug`,
				{
					basedir: "./routes",
					canonical: c.req.url, // TODO: normalize (i.e. trim trailing slash)
					isCurrentPath(path) {
						const normalizedPath = path.endsWith("/") ? path : `${path}/`;
						const normalizedRequestPath = c.req.path.endsWith("/")
							? c.req.path
							: `${c.req.path}/`;
						return normalizedPath === normalizedRequestPath;
					},
					currentPath: c.req.path,
					kebabCase,
					...data,
				},
			),
		)
	);

	await next();
});

app.use("*", logger());
app.use("*", serveStatic({ root: "./assets" }));
app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

app.get("/", async (c) => {
	const page = await getPage("home");

	return c.render("[page]", {
		title: page.title,
		page,
	});
});

// Rewrite trailing slashes
app.use("*", async (c, next) => {
	if (c.req.path.endsWith("/")) {
		return c.redirect(c.req.path.replace(/\/$/, ""), 301);
	}
	await next();
});

const me = {
	name: "Nathan Knowler",
	link: "https://knowler.dev",
};

app.use("/feed.xml", async (c) => {
	const posts = await getPosts();

	const feed = new Feed({
		title: "Nathan Knowler",
		description: "Some words.",
		id: "https://knowler.dev/",
		link: "https://knowler.dev/",
		language: "en-CA",
		copyright: "All rights reservered 2022, Nathan Knowler",
		generator: "Deno",
		author: me,
	});

	for (const post of posts) {
		feed.addItem({
			id: post.slug,
			title: post.title,
			description: post.description || undefined,
			link: `https://knowler.dev/blog/${post.slug}`,
			date: new Date(post.publishedAt),
			content: await Deno.readTextFile(`./routes/_blog/${post.slug}.html`),
			author: [me],
		});
	}

	c.header("content-type", "text/xml; charset=UTF-8");
	c.header("cache-control", "max-age=1800");

	return c.body(feed.rss2());
});

app.get("/blog", async (c) => {
	const posts = await getPosts();

	return c.render(
		"blog.index",
		{
			title: "Blog",
			posts,
		},
	);
});

app.get("/blog/:slug", async (c) => {
	try {
		const params = c.req.param();
		const post = await getPost(params.slug);

		return c.render("blog.[slug]", {
			title: post.title,
			description: post.description,
			post,
		});
	} catch (_) {
		return c.notFound();
	}
});

app.get("/:page", async (c) => {
	try {
		const params = c.req.param();
		const page = await getPage(params.page);

		return c.render("[page]", {
			title: page.title,
			page,
		});
	} catch (_) {
		return c.notFound();
	}
});

Deno.serve(app.fetch);
