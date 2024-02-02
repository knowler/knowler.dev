import { renderFile } from "pug";
import kebabCase from "case/paramCase";
import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { invariant } from "~/utils/invariant.js";

const SITE_URL = Deno.env.get("SITE_URL");
invariant(SITE_URL);

export function pugRenderer() {
	return async (c, next) => {
		const styles = new Set();
		c.setRenderer((template, data = {}) =>
			c.html(
				renderFile(
					`./routes/${template}.pug`,
					{
						filters: {
							css(text) {
								styles.add(text);
								return "";
							}
						},
						styles,
						flags: c.get("flags"),
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
			),
		);

		await next();
	};
}
