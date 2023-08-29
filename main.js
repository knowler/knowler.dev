import { contentType } from "std/media_types";
import { renderFile } from "pug";
import kebabCase from "case/paramCase";

const assetPattern = new URLPattern({ pathname: "/:filename.:extension" });

function handler(request) {
	const url = new URL(request.url);
	const assetMatch = assetPattern.exec({ pathname: url.pathname });

	if (assetMatch) return serveStatic({params: assetMatch?.pathname.groups });
	else if (url.pathname === "/") return homePage(request);
	else return notFound();
}

function notFound() {
	return new Response("Oops! Can’t find that. I’m doing a big rebuild, so try again soon.", {
		status: 404,
	});
}

function homePage(request) {
	const url = new URL(request.url);

	const body = renderFile("./routes/index.pug", {
		basedir: "./views",
		title: "Welcome – Nathan Knowler",
		canonical: request.url,
		isCurrentPath(path) {
			const normalizedPath = path.endsWith("/") ? path : `${path}/`;
			const normalizedRequestPath = url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
			return normalizedPath === normalizedRequestPath;
		},
		currentPath: url.pathname,
		kebabCase,
	});

	return new Response(body, {
		headers: {
			"content-type": "text/html; charset=utf8",
		},
	});
}

async function serveStatic({params}) {
  const {extension, filename} = params;

  if (!filename) return new Response(null, {status: 500});

  const filePath = `assets/${filename}.${extension}`;
  const fileUrl = new URL(filePath, import.meta.url);

  const body = await Deno.readFile(fileUrl);
  if (!body) return new Response(null, {status: 404});

  return new Response(body, {
    headers: {
      "content-type": contentType(extension),
    },
  });
}

Deno.serve(handler);
