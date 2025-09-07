import { default as Htmx } from "../component/Htmx";
import { default as Stylesheet } from "../component/Stylesheet";

/**
 *
 */
export default function UnrecoverableDocument() {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <base href="/" />
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Unrecoverable Error</title>

          <Htmx />
          <Stylesheet />
        </head>
        <body>
          <div class="flex flex-col px-8 pt-8">
            <h1 class="text-4xl">An unrecoverable error occured</h1>
            <div class="flex flex-col py-8 space-y-4">
              <div class="flex flex-col">
                <h2 class="text-xl font-semibold"> We couldn't save this request.</h2>
                <span>
                  Please try again in a few minutes, or&nbsp;
                  <a href="javascript:history.back()" class="text-blue-500 underline mt-8">go back.</a>
                </span>
              </div>
            </div>
          </div>
        </body>
      </html>
    </>
  );
}
