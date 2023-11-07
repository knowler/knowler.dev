import { extract } from "https://deno.land/std@0.205.0/front_matter/toml.ts";
import { stringify } from "https://deno.land/std@0.205.0/toml/mod.ts";

const DENO_KV_DB_UUID = Deno.env.get("DENO_KV_DB_UUID");
const kv = await Deno.openKv(`https://api.deno.com/databases/${DENO_KV_DB_UUID}/connect`);

const [slug] = Deno.args;

const idRecord = await kv.get(["postsBySlug", slug]);

if (!idRecord?.value) {
	console.error(`Cannot find post with slug ${slug}`);
	Deno.exit();
}

const postRecord = await kv.get(["posts", idRecord.value]);

if (!postRecord?.value) {
	console.error(`Cannot find post with slug ${slug} and id ${idRecord.value}`);
	Deno.exit();
}

const post = postRecord.value;
const { html, updatedAt: _updatedAt, ...postWithoutHTML } = post;

const fileName = `${post.id}.html`

const frontmatter = stringify(postWithoutHTML);

await Deno.writeTextFile(fileName, `---toml\n${frontmatter}---\n${html}`);

const command = new Deno.Command("nvim", {
	args: [fileName],
});

const process = command.spawn();

const output = await process.output();

if (output.success) {
	try {
	  const file = await Deno.readTextFile(fileName);
		const { body, attrs } = extract(file);
		const updatedPost = {
			...attrs,
			html: body,
			updatedAt: new Date().toISOString(),
		}
		await kv.set(["posts", post.id], updatedPost);
		console.log(`Succcessfully updated post: https://knowler.dev/blog/${post.slug}\n`, updatedPost);
		await Deno.remove(fileName);
	} catch(error) {
		console.error(error);
	}
}
