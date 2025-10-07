import { TaskDocument, database as assignmentDatabase } from "@tw050x.net.database/assignment";
import { useParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/middleware/use-access-token-cookie";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/middleware/use-login-state-cookie";
import { UsePaginationQueryParametersOptions, usePaginationQueryParameters } from "@tw050x.net.library/middleware/use-pagination-query-parameters";
import { UseUIMenuStateCookieOptions, useUIMenuStateCookie } from "@tw050x.net.library/middleware/use-ui-menu-state-cookie";
import { UseUIUserTableToolsStateCookieOptions, useUIUserTableToolsStateCookie } from "@tw050x.net.library/middleware/use-ui-user-table-tools-state-cookie";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/middleware/use-cors-headers";
import { useSecret } from "@tw050x.net.library/secret";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendInternalServerErrorHTMLResponse } from "@tw050x.net.library/service/helper/response/send-internal-server-error-html-response";
import { sendMovedTemporarilyRedirect } from "@tw050x.net.library/service/helper/redirect/send-moved-temporarily-redirect";
import { sendOKHTMLResponse} from "@tw050x.net.library/service/helper/response/send-ok-html-response";
import { useUrlQuery } from "@tw050x.net.library/service/helper/use-url-query";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { z } from "zod";
import { useAuthGate } from "../../../middleware/use-auth-gate";
import { default as Assignment, Props as AssignmentDocumentProps } from "../../../template/document/Assignment";

const getQuerySchema = z.object({
  pi: z.preprocess((value) => parseInt(value as string, 10), z.number().int().nonnegative()),
  ps: z.preprocess((value) => parseInt(value as string, 10), z.number().int().positive()),
});

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
  allowedOrigins: useParameter('portal.service.allowed-origins'),
};

const usePaginationQueryParametersOptions: UsePaginationQueryParametersOptions = {
  defaultPageIndex: useParameter('portal.service.assignment-query-parameters.default-page-index'),
  defaultPageSize: useParameter('portal.service.assignment-query-parameters.default-page-size'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: useParameter('cookie.access-token.name'),
  cookieDomain: useParameter('cookie.access-token.domain'),
  requiredPermissions: [
    'read:portal:users-page',
  ],
  jwtSecretKey: useSecret('jwt.secret-key'),
}

const useLoginStateCookieOptions: UseLoginStateCookieOptions = {
  allowedReturnUrlDomains: useParameter('authentication.service.allowed-return-url-domains'),
  cookieName: useParameter('cookie.login-state.name'),
  cookieDomain: useParameter('cookie.login-state.domain'),
  encrypterSecretKey: useSecret('encrypter.secret-key'),
}

const useUIMenuStateCookieOptions: UseUIMenuStateCookieOptions = {
  cookieName: useParameter('cookie.ui.menu.state.name'),
}

const useUIUserTableToolsStateCookieOptions: UseUIUserTableToolsStateCookieOptions = {
  cookieName: useParameter('cookie.ui.user-table-tools.state.name'),
  cookieDomain: useParameter('cookie.ui.user-table-tools.state.domain'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(useLoginStateCookieOptions),
  useAuthGate(),
  usePaginationQueryParameters(usePaginationQueryParametersOptions),
  useUIMenuStateCookie(useUIMenuStateCookieOptions),
  useUIUserTableToolsStateCookie(useUIUserTableToolsStateCookieOptions),

  // parse and validate query parameters
  // redirect to sane defaults if invalid
  async (context) => {

    // context.incomingMessage.queryParameters;

    let pageIndex: number;
    let pageSize: number;
    try {
      const result = getQuerySchema.parse(
        await useUrlQuery(context)
      );
      pageIndex = result.pi;
      pageSize = result.ps;
    }
    catch (error) {
      if (error instanceof z.ZodError) {
        return void sendMovedTemporarilyRedirect(
          context,
          new URL(`/portal/assignment?pi=0&ps=10`, `https://${await readParameter('portal.service.host')}`),
        );
      }
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }
  },

  // handle request
  async (context) => {
    let assignmentTasks;
    try {
      assignmentTasks = await assignmentDatabase.task.
        find({
          userProfileUuid: context.incomingMessage.accessTokenCookie.payload.sub,
          completed: false,
        }).
        limit(context.incomingMessage.query.parameters.pageSize).
        skip(context.incomingMessage.query.parameters.pageIndex * context.incomingMessage.query.parameters.pageSize)
    }
    catch (error) {
      logger.error(error);
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }

    //
    let tasks: Array<TaskDocument> = [];
    try {
      tasks = await assignmentTasks.toArray();
    }
    catch (error) {
      logger.error(error);
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }

    // render the assignment page with tasks
    const assignmentDocumentProps: AssignmentDocumentProps = {
      assignmentTaskTableProps: {
        tasks,
      },
      menuInitiatorProps: {
        state: context.incomingMessage.uiMenuStateCookie.state,
      }
    }
    return void sendOKHTMLResponse(context, await <Assignment {...assignmentDocumentProps} />);
  }
]);
