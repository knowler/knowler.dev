export function noRobots() {
	return async (c, next) => {
		c.header("X-Robots-Tag", "none");
		await next();
	};
}
