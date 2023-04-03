import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import isbot from 'isbot';
import { RemixServer } from "@remix-run/react";
import type { EntryContext } from "@remix-run/node";
import { etag } from "remix-etag";

const ABORT_DELAY = 5000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const callbackName = isbot(request.headers.get('User-Agent')) ? 'onAllReady' : 'onShellReady';

  return new Promise((resolve) => {
    let didError = false;

    const {pipe, abort} = renderToPipeableStream(
      <RemixServer context={remixContext} url={request.url} />,
      {
        [callbackName]() {
          const body = new PassThrough();

          responseHeaders.set('Content-Type', 'text/html');
					responseHeaders.set('Link', `${new URL('webmention', process.env.BASE_URL as string)}; rel="webmention"`);
					responseHeaders.set('content-security-policy', "default-src 'self'; style-src 'self' 'unsafe-inline';")

          resolve(
						etag({
							request,
							response: new Response(body, {
								status: didError ? 500 : responseStatusCode,
								headers: responseHeaders,
							}),
						}),
          );
          pipe(body);
        },
        onError(error: Error) {
          didError = true;
          console.error(error);
        },
      },
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
