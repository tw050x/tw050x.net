import { default as Head } from "../component/Head.js";

/**
 * The `<UnauthorisedDocument />` component.
 *
 */
export default function UnauthorisedDocument() {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <Head title="Unauthorised" />
        <body>
          <div class="flex flex-col px-8 pt-8">
            <h1 class="text-4xl">Unauthorised</h1>
            <div class="flex flex-col py-8 space-y-4">
              <div class="flex flex-col">
                <h2 class="text-xl font-semibold">You are not authenticated</h2>
                <span>
                  You should try to&nbsp;
                  <a href="/login" class="text-blue-500 underline mt-8">login.</a> or&nbsp;
                  <a href="/register" class="text-blue-500 underline mt-8">register.</a>
                </span>
              </div>
            </div>
          </div>
        </body>
      </html>
    </>
  );
}
