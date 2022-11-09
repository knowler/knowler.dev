import { ActionFunction, redirect } from "@remix-run/node";
import { authOrLogin } from "~/auth.server";
import { prisma } from "~/db.server";

export const action: ActionFunction = async ({ request, params }) => {
	await authOrLogin(request);

	await prisma.gardenPost.delete({ where: { id: params.id } });

	return redirect('/admin/garden');
}
