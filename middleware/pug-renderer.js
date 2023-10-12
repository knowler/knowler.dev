import { renderFile } from "pug";
import kebabCase from "case/paramCase";
import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";

export function pugRenderer() {
	return async (c, next) => {
		c.setRenderer((template, data = {}) =>
			c.html(
				renderFile(
					`./routes/${template}.pug`,
					{
						basedir: "./routes",
						isCurrentPath(path) {
							return trimTrailingSlash(path) === trimTrailingSlash(c.req.path);
						},
						currentPath: trimTrailingSlash(c.req.path),
						kebabCase,
						SITE_URL: Deno.env.get("SITE_URL"),
						...data,
					},
				),
			)
		);

		await next();
	};
}
