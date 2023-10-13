import kv from "~/kv.js";

export async function getPost(id) {
	const postRecord = await kv.get(["posts", id]);
	if (!postRecord.value) throw `post not found with id: ${id}`;

	return postRecord.value;
}

export async function getPostBySlug(slug) {
	const idRecord = await kv.get(["postsBySlug", slug]);
	if (!idRecord.value) throw `post not found with slug: ${slug}`;

	return await getPost(idRecord.value);
}

export async function getPosts() {
	const iter = kv.list({ prefix: ["posts"] });
	const posts = [];

	for await (const record of iter) posts.push(record.value);

	posts.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));

	return posts;
}
