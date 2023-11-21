export function deferImportGet(pathname: string) {
	return async () => {
		const module = await import(pathname);

		return module.get(...arguments);
	};
}

export function deferImportPost(pathname: string) {
	return async () => {
		const module = await import(pathname);

		return module.post(...arguments);
	}
}
