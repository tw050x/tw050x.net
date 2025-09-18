import { logger } from "@tw050x.net.library/logger";
import { ServiceContext } from "@tw050x.net.library/service";
import { default as Cookies } from "cookies";

type UIMenuStateCookie = {
  raw?: string;
  state: 'open' | 'collapsed';
}

declare module "node:http" {
  interface IncomingMessage {
    uiMenuStateCookie: UIMenuStateCookie
  }
}

type UseUIMenuStateCookieOptions = {
  getConfiguration: (context: { configuration: ServiceContext['configuration'] }) => Promise<{
    cookieName: string;
  }>;
}

/**
 * @returns void
 */
export const useUIMenuStateCookieReader = (options: UseUIMenuStateCookieOptions) => async (context: ServiceContext) => {
  const cookies = new Cookies(context.incomingMessage, context.serverResponse, {
    secure: true,
  });
  let configuration;
  try {
    configuration = await options.getConfiguration({ configuration: context.configuration });
  }
  catch (error) {
    logger.error('unable to read UI menu state cookie', { error });
    context.serverResponse.statusCode = 500;
    return void context.serverResponse.end();
  }
  const cookieName = configuration.cookieName;
  const cookie = cookies.get(cookieName);
  const refreshableTokenCookie: UIMenuStateCookie = {
    raw: cookie,
    state: 'collapsed',
  }
  if (cookie === 'open') {
    refreshableTokenCookie.state = 'open';
  }
  context.incomingMessage.uiMenuStateCookie = refreshableTokenCookie
}
