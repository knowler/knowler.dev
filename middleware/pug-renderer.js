import { renderFile } from "pug";
import kebabCase from "case/paramCase";
import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { invariant } from "~/utils/invariant.js";

const SITE_URL = Deno.env.get("SITE_URL");
invariant(SITE_URL);

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
						SITE_URL,
						...data,
					},
				),
			)
		);

		await next();
	};
}
