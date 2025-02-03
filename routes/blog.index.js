import { trimTrailingSlash } from "~/utils/trim-trailing-slash.js";
import { winnipegDateTime } from "~/utils/winnipeg-datetime.js";
import { ulidFromISOString } from "~/utils/ulid-from-iso-string.js";

const prettyTime = new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeZone: "UTC" }).format;

export async function get(c) {
	let { after, before, oldest } = c.req.query();
	let latest = after == null && before == null && oldest == null;
	oldest = oldest === "";
	const kv = c.get("kv");

	let start, end, invalidRange;

	if (!oldest && after) start = ["posts", ulidFromISOString(after, 1)];
	if (!oldest && before) end = ["posts", ulidFromISOString(before, -1)];
	if (after && before && new Date(after).getTime() >= new Date(before).getTime()) {
		invalidRange = true;
		start = undefined;
		end = undefined;
	}

	const posts = await Array.fromAsync(
		kv.list(
			{
				prefix: start && end ? undefined : ["posts"],
				start,
				end,
			},
			{
				limit: 10,
				reverse: !oldest,
			},
		),
		entry => entry.value,
	);

	for (const post of posts) c.get("posts").store(post);

	if (oldest) posts.reverse();

	const mostRecent = posts.at(0)?.publishedAt;
	const leastRecent = posts.at(-1)?.publishedAt;

	return c.render(
		"blog.index",
		{
			title: "Blog",
			posts: posts.map((post) => {
				post.prettyDateString = winnipegDateTime(new Date(post.publishedAt));
				return post;
			}),
			canonical: trimTrailingSlash(c.req.url),
			pagination: {
				before,
				//beforePretty: end && before && prettyTime(new Date(before)),
				after,
				//afterPretty: start && after && prettyTime(new Date(after)),
				invalidRange,
				mostRecent,
				leastRecent,
				isLatest: latest,
				isOldest: oldest,
				currentRangePretty:
					latest ? `${prettyTime(new Date(leastRecent))} until present` :
					oldest ? `${prettyTime(new Date(leastRecent))} until ${prettyTime(new Date(mostRecent))}` :
					after && mostRecent ? `${prettyTime(new Date(new Date(after).getTime() + 1))} until ${prettyTime(new Date(mostRecent))}` :
					before && leastRecent ? `${prettyTime(new Date(leastRecent))} until ${prettyTime(new Date(new Date(before).getTime() - 1))}` :
					undefined
			},
		},
	);
}
