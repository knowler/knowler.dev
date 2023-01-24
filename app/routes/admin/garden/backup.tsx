import { json, LoaderArgs } from "@remix-run/node";
import { authOrLogin } from "~/auth.server";
import { prisma } from "~/db.server";

export async function loader({ request }: LoaderArgs) {
	await authOrLogin(request);

	return json(
		{
			garden: await prisma.gardenPost.findMany(),
		},
		{
			headers: {
				'content-disposition': `attachment; filename="knowler.dev-garden-export-${(new Date()).toISOString().replaceAll(/[TZ:.-]/g, '')}.json"`,
			}
		}
	);
}
