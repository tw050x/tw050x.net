import { default as Head } from "../component/Head.js";

/**
 * The `<BadRequest />` component.
 *
 */
export default function BadRequest() {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <Head title="Bad Request" />
        <body>
          <div class="flex flex-col px-8 pt-8">
            <h1 class="text-4xl">We received a bad request</h1>
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
