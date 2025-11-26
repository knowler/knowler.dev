const isProduction = Deno.env.get("ENV") === "production";
const prefix = "Invariant failed";

/**
 * @param {any} condition
 * @param {string | () => string} [message]
 * @returns {asserts condition}
 */
export function invariant(condition, message) {
	if (condition) return;
	if (isProduction) throw new Error(prefix);
	const provided = typeof message === "function" ? message() : message;
	const value = provided ? `${prefix}: ${provided}` : prefix;
	throw new Error(value);
}
