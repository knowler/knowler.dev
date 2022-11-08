export function omit<T extends object, Key extends keyof T>(model: T, ...keys: Key[]): Omit<T, Key> {
	for (const key of keys) {
		delete model[key];
	}
	return model;
}

const isProduction: boolean = process.env.NODE_ENV === "production";
const prefix: string = "Invariant failed";
export function invariant(condition: any, message?: string | (() => string)): asserts condition {
	if (condition) return;
	if (isProduction) throw new Error(prefix);
	const provided: string | undefined = typeof message === "function" ? message() :  message;
	const value: string = provided ? `${prefix}: ${provided}` : prefix;
	throw new Error(value);
}

/** Format it for Winterpeg, eh? */
export function winterpegDateTime(date: string): string {
	return new Date(date).toLocaleString('en-ca', {
		timeZone: 'America/Winnipeg',
	});
}
