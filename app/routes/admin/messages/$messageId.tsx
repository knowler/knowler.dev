import { json, LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authOrLogin } from "~/auth.server";
import { prisma } from "~/db.server";
import { notFound } from "~/utils";

export async function loader({request, params}: LoaderArgs) {
	await authOrLogin(request);

	const message = await prisma.contactFormSubmission.findUnique({
		where: { id: params.messageId },
	});

	if (!message) return notFound();

	return json({ message });
}

export default function Message() {
	const {message} = useLoaderData<typeof loader>();

  return (
    <article className="message">
      <h1>{message.subject}</h1>
      <div>
        From: <a href={`mailto:${message.email}`}>{message.name}</a>
      </div>
      <div>
        Sent: <time>{message?.createdAt}</time>
      </div>
      <div>
        {message?.message}
      </div>
    </article>
  );
}
