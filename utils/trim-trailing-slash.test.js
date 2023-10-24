import { assert } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { trimTrailingSlash } from "./trim-trailing-slash.js";

Deno.test("trims trailing slash for URL string", () => {
	const urlString = "https://example.com/about/";

	assert(
		trimTrailingSlash(urlString),
		"https://example.com/about",
	);
});

Deno.test("trims trailing slash for URL object", () => {
	const url = new URL("https://example.com/about/");

	assert(
		trimTrailingSlash(url).href,
		"https://example.com/about",
	);
});

Deno.test("doesn’t trim trailing slash for root", () => {
	const urlString = "http://example.com/";
	const url = new URL(urlString);

	assert(
		trimTrailingSlash(urlString),
		urlString,
	);

	assert(
		trimTrailingSlash(url).href,
		urlString,
	);
});
