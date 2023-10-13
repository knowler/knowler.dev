import { getPage, getPages } from "~/models/pages.js";
import { getPost, getPosts } from "~/models/posts.js";

const modelByCollectionType = {
	pages: {
		labels: {
			singular: "Page",
			multiple: "Pages",
		},
		get: getPage,
		getMany: getPages,
	},
	posts: {
		labels: {
			singular: "Post",
			multiple: "Posts",
		},
		get: getPost,
		getMany: getPosts,
	},
};

export async function get(c) {
	const { collectionType } = c.req.param();
	const collection = modelByCollectionType[collectionType];
	const collectionItems = await collection.getMany();

	return c.render("sudo/content.[collectionType].index", {
		title: collection.labels.multiple,
		labels: collection.labels,
		type: collectionType,
		items: collectionItems.entries(),
	});
}
