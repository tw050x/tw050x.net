import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const htmxScript = readFileSync(resolve(__dirname, "../../node_modules/htmx.org/dist/htmx.min.js"), "utf8");
const htmxExtensionResponseTargetsScript = readFileSync(resolve(__dirname, "../../node_modules/htmx-ext-response-targets/dist/response-targets.min.js"), "utf8");

/**
 *
 */
export default function Htmx() {
  return (
    <>
      <script>{htmxScript}</script>
      <script>{htmxExtensionResponseTargetsScript}</script>
    </>
  );
}
