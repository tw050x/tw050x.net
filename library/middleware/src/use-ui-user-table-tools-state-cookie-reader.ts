import { logger } from "@tw050x.net.library/logger";
import { ServiceContext } from "@tw050x.net.library/service";
import { default as Cookies } from "cookies";

type UIUserTableToolsStateCookie = {
  raw?: string;
  state: 'open' | 'collapsed';
}

declare module "node:http" {
  interface IncomingMessage {
    uiUserTableToolsStateCookie: UIUserTableToolsStateCookie
  }
}

type UseUIUserTableToolsStateCookieReaderOptions = {
  getConfiguration: (context: { configuration: ServiceContext['configuration'] }) => Promise<{
    cookieName: string;
  }>;
}

/**
 * @returns void
 */
export const useUIUserTableToolsStateCookieReader = (options: UseUIUserTableToolsStateCookieReaderOptions) => async (context: ServiceContext) => {
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  let configuration;
  try {
    configuration = await options.getConfiguration({ configuration: context.configuration });
  }
  catch (error) {
    logger.error('unable to read UI user table tools cookie', { error });
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
  }
  const cookieName = configuration.cookieName;
  const cookie = cookies.get(cookieName);
  const refreshableTokenCookie: UIUserTableToolsStateCookie = {
    raw: cookie,
    state: 'collapsed',
  }
  if (cookie === 'open') {
    refreshableTokenCookie.state = 'open';
  }
  context.incomingMessage.uiUserTableToolsStateCookie = refreshableTokenCookie
}
