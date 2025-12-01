import { default as Head } from "../component/Head.js";

/**
 * The `<NotFoundDocument />` component.
 *
 */
export default function NotFoundDocument() {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <Head title="Not Found" />
        <body>
          <div class="flex flex-col px-8 pt-8">
            <h1 class="text-4xl">Not Found</h1>
            <div class="flex flex-col py-8 space-y-4">
              <div class="flex flex-col">
                <h2 class="text-xl font-semibold">The requested resource could not be found.</h2>
                <span>
                  You should navigate somewhere else, or&nbsp;
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
