import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { getSeoMeta } from "~/seo";
import { notFound } from "~/utils";

export const meta: MetaFunction = ({ data }) => getSeoMeta({
	title: data.page.title,
	description: data.page?.description,
});

export async function loader({ params }: LoaderArgs) {
  let page = await prisma.page.findFirst({
		where: {
			slug: params.page,
			published: true,
		},
  });

	if (!page) return notFound();

  return json({ page });
};

export default function Page() {
  const { page } = useLoaderData<typeof loader>();

  return (
		<article
			className="prose"
			dangerouslySetInnerHTML={{ __html: page.html }}
		/>
  );
}
