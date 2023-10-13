import { getModelForCollection } from "~/models/collection.js";

export async function get(c) {
	const { collectionType } = c.req.param();
	const { labels, getMany } = getModelForCollection(collectionType);
	const collectionItems = await getMany();

	return c.render("sudo/content.[collectionType].index", {
		title: labels.multiple,
		labels: labels,
		type: collectionType,
		items: collectionItems,
	});
}
