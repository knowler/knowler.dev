import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import isbot from 'isbot';
import { RemixServer } from "@remix-run/react";
import type { EntryContext } from "@remix-run/node";

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

          resolve(
            new Response(body, {
              status: didError ? 500 : responseStatusCode,
              headers: responseHeaders,
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
