import { default as defineHealthcheck } from "@tw050x.net.library/platform/healthcheck";

export default defineHealthcheck({
  filePath: '/healthcheck',
  checkInterval: 15_000,
});
