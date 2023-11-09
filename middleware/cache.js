import { kvCachesOpen } from "http://esm.sh/gh/tunnckoCore/deno-httpcache-kv/mod.ts";

const CACHE = { open: kvCachesOpen };

export function cache() {

	return async (c, next) => {
		const key = c.req.url;
		const cache = await CACHE.open("http-v0-cache");
		const cachedResponse = await cache.match(key);

		if (!cachedResponse) {
			await next();
			if (!c.res.ok) {
				c.header("x-cache-status", "BYPASS");
				return;
			}

			if (!c.res.headers.has("cache-control")) {
				c.header("cache-control", "s-maxage=60");
			}
			c.header("x-cache-status", "MISS");
			await cache.put(key, c.res);
		} else {
			cachedResponse.headers.set("x-cache-status", "HIT")
			return new Response(cachedResponse.body, cachedResponse);
		}
	}
}
