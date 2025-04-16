import { renderFile } from "pug";
import kebabCase from "case/paramCase";
import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { invariant } from "~/utils/invariant.js";
import { isCSSNakedDay } from "~/utils/is-css-naked-day.js";
import { library, icon, findIconDefinition } from "npm:@fortawesome/fontawesome-svg-core";
import { fab } from "npm:@fortawesome/free-brands-svg-icons";
import { fas } from "npm:@fortawesome/pro-solid-svg-icons";
import { far } from "npm:@fortawesome/pro-regular-svg-icons";

const SITE_URL = Deno.env.get("SITE_URL");
invariant(SITE_URL);

// Add brand icons to library
library.add(fab, fas, far);

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
						icon,
						styles,
						flags: c.get("flags"),
						basedir: "./routes",
						isCurrentPath(path) {
							return trimTrailingSlash(path) === trimTrailingSlash(c.req.path);
						},
						currentPath: trimTrailingSlash(c.req.path),
						kebabCase,
						SITE_URL,
						isCSSNakedDay: isCSSNakedDay(),
						...data,
					},
				),
			),
		);

		await next();
	};
}
