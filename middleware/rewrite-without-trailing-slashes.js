import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";

export function rewriteWithoutTrailingSlashes() {
	return async (c, next) => {
		if (c.req.path !== "/" && c.req.path.endsWith("/")) {
			return c.redirect(trimTrailingSlash(c.req.path), 301);
		}
		await next();
	};
}
