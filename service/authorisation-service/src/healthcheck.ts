import { defineHealthcheck } from "@tw050x.net.library/service";

export default defineHealthcheck({
  filePath: '/healthcheck',
  checkInterval: 15_000,
});
