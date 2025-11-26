import { isCSSNakedDay } from "~/utils/is-css-naked-day.js";

export function cssNakedDay() {
	return async (c, next) => {
		if (isCSSNakedDay()) c.res.headers.append("content-security-policy", "style-src 'none'");
		await next();
	}
}
