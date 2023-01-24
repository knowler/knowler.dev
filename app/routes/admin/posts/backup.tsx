import { json, LoaderArgs } from "@remix-run/node";
import { authOrLogin } from "~/auth.server";
import { prisma } from "~/db.server";

export async function loader({request}: LoaderArgs) {
	await authOrLogin(request);

	const posts = await prisma.post.findMany();

	return json({ posts });
}
