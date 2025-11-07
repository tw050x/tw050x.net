import { default as Head } from "../component/Head.js";

/**
 * The `<ForbiddenDocument />` component.
 *
 */
export default function ForbiddenDocument() {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <Head title="Forbidden" />
        <body>
          <div class="flex flex-col px-8 pt-8">
            <h1 class="text-4xl">Forbidden</h1>
            <div class="flex flex-col py-8 space-y-4">
              <div class="flex flex-col">
                <h2 class="text-xl font-semibold">You do not have permission to access this resource.</h2>
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
