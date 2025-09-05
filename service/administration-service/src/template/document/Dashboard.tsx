import { Component } from "@kitajs/html";
import { default as Htmx } from "@tw050x.net/uikit-library/component/Htmx";
import { default as Stylesheet } from "@tw050x.net/uikit-library/component/Stylesheet";

type Props = {};

/**
 *
 */
const DashboardDocument: Component<Props> = () => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <base href="/" />
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Administration Dashboard</title>

          <Htmx />
          <Stylesheet />
        </head>
        <body>
          <div class="flex flex-col px-8 pt-8">
            <h1 class="text-4xl">Dashboard</h1>
          </div>
        </body>
      </html>
    </>
  );
}
export default DashboardDocument;
