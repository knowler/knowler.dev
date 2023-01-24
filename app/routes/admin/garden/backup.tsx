import { json, LoaderArgs } from "@remix-run/node";
import { authOrLogin } from "~/auth.server";
import { prisma } from "~/db.server";

export async function loader({ request }: LoaderArgs) {
	await authOrLogin(request);

	return json(
		{
			posts: await prisma.post.findMany(),
		},
		{
			headers: {
				'content-disposition': `attachment; filename="knowler.dev-posts-export-${(new Date()).toISOString().replaceAll(/[TZ:.-]/g, '')}.json"`,
			}
		}
	);
}
