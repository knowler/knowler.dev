/**
 * Trims the trailing slash from a URL, URL href, or relative URL path.
 *
 * @template {string | URL} T
 * @param {T} pathOrURL
 * @returns {T}
 */
export function trimTrailingSlash(pathOrURL) {
	if (URL.canParse(pathOrURL)) {
		const url = pathOrURL instanceof URL ? pathOrURL : new URL(pathOrURL);

		if (url.pathname === "/") return pathOrURL;

		url.pathname = url.pathname.replace(/\/$/, "");

		return pathOrURL instanceof URL ? url : url.href;
	}

	return pathOrURL === "/" ? pathOrURL : pathOrURL.replace(/\/$/, "");
}
