import { contentType } from "std/media_types";
import { renderFile } from "pug";
import kebabCase from "case/paramCase";
import { getSession } from "~/sessions.js";

import * as indexRoute from "~/routes/index.js";
import * as blogIndexRoute from "~/routes/blog.index.js";
import * as blogPostRoute from "~/routes/blog.[slug].js";
import * as webmentionRoute from "~/routes/webmention.js";
import * as pageRoute from "~/routes/[page].js";

const SITE_URL = Deno.env.get("SITE_URL");
const assetPattern = new URLPattern({ pathname: "/:filename+.:extension" });
const sudoRoutePattern = new URLPattern({ pathname: "/sudo/:etc+" });

const publicRoutes = [
	indexRoute,
	blogIndexRoute,
	blogPostRoute,
	webmentionRoute,
	pageRoute,
];

async function handle(request) {
  const url = new URL(request.url);
  const assetMatch = assetPattern.exec({ pathname: url.pathname });

  console.log(request.method, url.pathname, {asset: Boolean(assetMatch)});

  let response;

  if (assetMatch) response = await serveStatic({params: assetMatch?.pathname.groups });
  else {
    const isSudoRoute = sudoRoutePattern.test({ pathname: url.pathname });
    try {
      response = isSudoRoute ? handleSudoRoute(request) : handlePublicRoute(request);
    } catch (errorOrResponse) {
      response = errorOrResponse instanceof Response
        ? errorOrResponse
        : new Response(`<pre><code>${JSON.stringify(errorOrResponse?.message, null, 2)}</code></pre>`, {
          status: 500, 
          headers: {
            'content-type': 'text/html; charset=utf8',
          },
        });
    }
  }

  return response;
}

async function handleSudoRoute() {
  const session = await getSession(request);
	console.log(session);
	// TODO: implement
	console.warn("Unimplemented");
}

function handlePublicRoute(request) {
  return matchRequestToRoutes(request, publicRoutes);
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

async function matchRequestToRoutes(request, routes) {
  const url = new URL(request.url);
  for (const route of routes) {
    const matched = route.pattern.exec({pathname: url.pathname});
    let response;
    if (matched) {
      const view = createView(request);
			// TODO: idk what this first condition is anymore. Maybe remove it?
      if ('module' in route) {
        const module = await route.module();
        response = await module[request.method]({request, params: matched.pathname?.groups, view})
      } else {
				let methodHandler = route[request.method];
				// Fallback to GET if POST method not found
				// TODO: Does it make sense to error out with a 405 instead?
				if (!methodHandler && request.method === "POST") methodHandler = route.GET;
				if (!methodHandler) throw `Missing method handler for: ${request.method} ${url.pathname}`;
        response = await methodHandler({request, params: matched.pathname?.groups, view})
      }
      return response
    }
  }

  return new Response("Not found", { status: 404 });
}

function createView(request) {
  const url = new URL(request.url);

  return function view(template, context = {}, init = {}) {
    init.headers ??= new Headers();
    init.headers.set('content-type', 'text/html; charset=utf8');

    return new Response(
      renderFile(`./routes/${template}.pug`, {
				basedir: './routes',
				canonical: request.url, // TODO: normalize (i.e. trim trailing slash)
				SITE_URL,
        isCurrentPath(path) {
          const normalizedPath = path.endsWith('/') ? path : `${path}/`;
          const normalizedRequestPath = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
          return normalizedPath === normalizedRequestPath;
        },
        currentPath: url.pathname,
				kebabCase,
        ...context,
      }),
      init,
    );
  }
}

Deno.serve(handle);
