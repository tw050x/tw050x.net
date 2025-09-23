import { logger } from "@tw050x.net.library/logger";
import { ServiceContext } from "@tw050x.net.library/service";
import { default as Cookies } from "cookies";

type RefreshableTokenCookie = {
  raw?: string;
}

declare module "node:http" {
  interface IncomingMessage {
    refreshableTokenCookie: RefreshableTokenCookie
  }
}

type UseRefreshableTokenCookieReaderOptions = {
  getConfiguration: (context: { configuration: ServiceContext['configuration'] }) => Promise<{
    cookieName: string;
  }>;
}

/**
 * @returns void
 */
export const useRefreshableTokenCookieReader = (options: UseRefreshableTokenCookieReaderOptions) => async (context: ServiceContext) => {
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  let configuration;
  try {
    configuration = await options.getConfiguration({ configuration: context.configuration });
  }
  catch (error) {
    logger.error(error);
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
  }
  const cookieName = configuration.cookieName;
  const cookie = cookies.get(cookieName);
  const refreshableTokenCookie: RefreshableTokenCookie = {
    raw: cookie,
  }
  context.incomingMessage.refreshableTokenCookie = refreshableTokenCookie
}
