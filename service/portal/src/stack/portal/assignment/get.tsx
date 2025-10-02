import { TaskDocument, database as assignmentDatabase } from "@tw050x.net.database/assignment";
import { useParameter, readParameter } from "@tw050x.net.library/configuration";
import { logger } from "@tw050x.net.library/logger";
import { UseAccessTokenCookieReaderOptions, useAccessTokenCookieReader } from "@tw050x.net.library/middleware/use-access-token-cookie-reader";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { UseLoginStateCookieWriterOptions, useLoginStateCookieWriter } from "@tw050x.net.library/middleware/use-login-state-cookie-writer";
import { UsePaginationQueryParametersOptions, usePaginationQueryParameters } from "@tw050x.net.library/middleware/use-pagination-query-parameters";
import { UseUIMenuStateCookieReaderOptions, useUIMenuStateCookieReader } from "@tw050x.net.library/middleware/use-ui-menu-state-cookie-reader";
import { UseUIUserTableToolsStateCookieReaderOptions, useUIUserTableToolsStateCookieReader } from "@tw050x.net.library/middleware/use-ui-user-table-tools-state-cookie-reader";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/middleware/use-cors-headers";
import { useSecret } from "@tw050x.net.library/secret";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { sendSeeOtherRedirect } from "@tw050x.net.library/service/helper/redirect/send-see-other-redirect";
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

const useAccessTokenCookieReaderOptions: UseAccessTokenCookieReaderOptions = {
  cookieName: useParameter('cookie.access-token.name'),
  requiredPermissions: [
    'read:portal:users-page',
  ],
  jwtSecretKey: useSecret('jwt.secret-key'),
}

const useLoginStateCookieWriterOptions: UseLoginStateCookieWriterOptions = {
  cookieName: useParameter('cookie.login-state.name'),
  cookieDomain: useParameter('cookie.login-state.domain'),
  encrypterSecretKey: useSecret('encrypter.secret-key'),
}

const useUIMenuStateCookieReaderOptions: UseUIMenuStateCookieReaderOptions = {
  cookieName: useParameter('cookie.ui.menu.state.name'),
}

const useUIUserTableToolsStateCookieReaderOptions: UseUIUserTableToolsStateCookieReaderOptions = {
  cookieName: useParameter('cookie.ui.user-table-tools.state.name'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookieReader(useAccessTokenCookieReaderOptions),
  useLoginStateCookieWriter(useLoginStateCookieWriterOptions),
  useAuthGate(),
  usePaginationQueryParameters(usePaginationQueryParametersOptions),
  useUIMenuStateCookieReader(useUIMenuStateCookieReaderOptions),
  useUIUserTableToolsStateCookieReader(useUIUserTableToolsStateCookieReaderOptions),

  // parse and validate query parameters
  // redirect to sane defaults if invalid
  async (context) => {

    context.incomingMessage.queryParameters;

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
      assignmentTasks = await assignmentDatabase.task.find({
        userProfileUuid: context.incomingMessage.accessTokenCookie.payload.sub,
        completed: false,
      })
    }
    catch (error) {
      logger.error(error);
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }

    // redirect to the dashboard if there are no pending assignments
    // return an error page if the check itself fails
    try {
      if (await assignmentTasks.hasNext() === false) {
        return void sendSeeOtherRedirect(
          context,
          new URL('/portal/dashboard', `https://${context.incomingMessage.headers.host}`)
        );
      }
    }
    catch (error) {
      logger.error(error);
      return void sendInternalServerErrorHTMLResponse(context, await <UnrecoverableDocument />);
    }

    //
    let tasks: Array<TaskDocument> = [];
    try {
      // TODO: add limit to tasks
      while (await assignmentTasks.hasNext()) {
        await assignmentTasks.next().then((task) => task && tasks.push(task));
      }
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
