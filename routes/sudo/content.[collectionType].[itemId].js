import { getModelForCollection } from "~/models/collection.js";

export async function get(c) {
	const { collectionType, itemId } = c.req.param();
	const { getById } = getModelForCollection(collectionType)
	const item = await getById(itemId);

	console.log(import.meta);
	return c.render("sudo/content.[collectionType].[itemId]", {
		title: "Editing",
		item,
	});

}
