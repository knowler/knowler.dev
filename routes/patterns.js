import { Hono } from "hono";

const patterns = new Hono();

patterns.get("/", async (...args) => {
	const { get } = await import("~/routes/patterns/index.js");
	return get(...args);
});
patterns.get("/switch", async (...args) => {
	const { get } = await import("~/routes/patterns/switch.js");
	return get(...args);
});
patterns.post("/switch", async (...args) => {
	const { post } = await import("~/routes/patterns/switch.js");
	return post(...args);
});

export { patterns };
