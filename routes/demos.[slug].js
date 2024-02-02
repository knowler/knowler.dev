export async function get(c, next) {
	try {
		const params = c.req.param();
		const demo = await c.get("demos").get(params.slug);
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
