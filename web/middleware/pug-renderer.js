import { renderFile } from "pug";
import { toKebabCase as kebabCase } from "@std/text/to-kebab-case";
import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { invariant } from "@knowler/shared/invariant";
import { isCSSNakedDay } from "~/utils/is-css-naked-day.js";
import { library, icon, findIconDefinition } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/pro-solid-svg-icons";

const SITE_URL = Deno.env.get("SITE_URL");
invariant(SITE_URL);

// Add brand icons to library
library.add(fab, fas);

export function pugRenderer() {
	return async (c, next) => {
		const styles = new Set();
		c.setRenderer((template, data = {}) =>
			c.html(
				renderFile(
					`./web/routes/${template}.pug`,
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
						basedir: "./web/routes",
						isCurrentPath(path) {
							return trimTrailingSlash(path) === trimTrailingSlash(c.req.path);
						},
						currentPath: trimTrailingSlash(c.req.path),
						kebabCase,
						SITE_URL,
						isCSSNakedDay: isCSSNakedDay(),
						BUILD_ID: Deno.env.get("DENO_DEPLOY_BUILD_ID"),
						...data,
					},
				),
			),
		);

		await next();
	};
}
