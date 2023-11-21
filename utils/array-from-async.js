export async function arrayFromAsync(asyncIterator, mapFn) {
	const array = [];
	for await (const item of asyncIterator) array.push(item);
	return mapFn ? array.map(mapFn) : array;
}
