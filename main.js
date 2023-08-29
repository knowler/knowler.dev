const assetPattern = new URLPattern({ pathname: "/:filename.:extension" });
const html = String.raw;
const home = html`
<!doctype html>
<html lang="en-ca">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Nathan Knowler</title>
		<meta name="color-scheme" content="dark light">
		<style>:root { font-family: system-ui, sans-serif; }</style>
	</head>
	<body>
		<h1>Welcome to my website</h1>
		<p>I’m currently rebuilding it. Sorry for the deadlinks.</p>
	</body>
</html>
`.trim();

function handler(request) {
	const url = new URL(request.url);
	const assetMatch = assetPattern.exec({ pathname: url.pathname });

	if (assetMatch) return serveStatic({params: assetMatch?.pathname.groups });
	else if (url.pathname === "/") return homePage();
	else return notFound();
}

function notFound() {
	return new Response("Oops! Can’t find that. I’m doing a big rebuild, so try again soon.", {
		status: 404
	});
}

function homePage() {
	return new Response(home, {
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
      'content-type': contentType(extension),
    },
  });
}

Deno.serve(handler);
