import kv from "~/kv.js";

export async function get(c, next) {
	try {
		console.log(c.header("referer"));
		const params = c.req.param();
		const demo = (await kv.get(["demos", params.slug])).value;
		const query = c.req.query();

		delete demo.pug;
		
		return c.render("demos.[slug]", {
			pretty: true,
			codepen: query.codepen != null,
			demo,
		});
	} catch (e) {
		console.error(e);
		await next();
	}
}
