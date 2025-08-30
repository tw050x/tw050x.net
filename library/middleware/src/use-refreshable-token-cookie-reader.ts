import { default as logger } from "@tw050x.net/logger";
import { ServiceContext } from "@tw050x.net/service";
import { default as Cookies } from "cookies";

type RefreshableTokenCookie = {
  raw?: string;
}

declare module "node:http" {
  interface IncomingMessage {
    refreshableTokenCookie: RefreshableTokenCookie
  }
}

type UseRefreshableTokenCookieOptions = {
  getConfiguration: (context: ServiceContext['configuration']) => Promise<{
    cookieName: string;
  }>;
}

/**
 * @returns void
 */
export const useRefreshableTokenCookieReader = (options: UseRefreshableTokenCookieOptions) => async (context: ServiceContext) => {
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });

  let configuration;

  try {
    configuration = await options.getConfiguration(context.configuration);
  }
  catch (error) {
    logger.error('unable to read access token cookie', { error });
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
