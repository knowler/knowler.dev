import { getPage, getPageBySlug, getPages } from "~/models/pages.js";
import { getPost, getPostBySlug, getPosts } from "~/models/posts.js";

const modelByCollectionType = {
	pages: {
		labels: {
			singular: "Page",
			multiple: "Pages",
		},
		getById: getPage,
		getBySlug: getPageBySlug,
		getMany: getPages,
	},
	posts: {
		labels: {
			singular: "Post",
			multiple: "Posts",
		},
		getById: getPost,
		getBySlug: getPostBySlug,
		getMany: getPosts,
	},
};

export function getModelForCollection(type) {
	return modelByCollectionType[type];
}
