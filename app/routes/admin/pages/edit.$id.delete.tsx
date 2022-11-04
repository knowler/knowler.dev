import { ActionFunction, redirect } from "@remix-run/node";
import { auth } from "~/auth.server";
import { prisma } from "~/db.server";

export const action: ActionFunction = async ({request, params}) => {
  const { pathname } = new URL(request.url);
  await auth.isAuthenticated(request, {
    failureRedirect: `/login?returnTo=${pathname}`,
  });

	await prisma.page.delete({where: {id: params.id}});

	return redirect('/admin/pages');
}
