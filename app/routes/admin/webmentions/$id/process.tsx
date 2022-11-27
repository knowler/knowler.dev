import { Window } from "happy-dom";
import { ActionFunction, json } from "@remix-run/node";
import { redirectBack } from "remix-utils";
import { authOrLogin } from "~/auth.server";
import { prisma } from "~/db.server";

function isHtml(response: Response) {
	return response.headers.get('Content-Type')?.split(';').map(part => part.trim()).includes('text/html');
}

export const action: ActionFunction = async ({request, params}) => {
	await authOrLogin(request);

	const webmention = await prisma.webmention.findUnique({ where: { id: params.id } });

	if (!webmention) throw "Not found";

	const result = await fetch(webmention.source, {
		headers: {
			'User-Agent': 'Webmention',
		},
	});

	if (!result.ok) throw "Not ok";

	if (!isHtml(result)) throw "Not html";

	const w = new Window();
	w.document.write(await result.text());

	const author = w.document.querySelector('meta[name="author"]')?.content;
	const title = w.document.querySelector('h1')?.textContent.trim() || w.document.querySelector('title').textContent.trim();
	const content = w.document.querySelector('.h-entry');

	await prisma.webmention.update({
		where: { id: params.id },
		data: { author, title, content },
	});

	return redirectBack(request, { fallback: '/admin/webmentions' });
}

