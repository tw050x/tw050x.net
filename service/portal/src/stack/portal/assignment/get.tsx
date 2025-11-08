import { database as assignmentDatabase } from "@tw050x.net.database/assignment";
import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/authentication/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/authentication/middleware/use-login-state-cookie";
import { sanitizeMongoDBFilterOrPipeline } from "@tw050x.net.library/database";
import { logger } from "@tw050x.net.library/logger";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { UsePaginationQueryParametersOptions, usePaginationQueryParameters } from "@tw050x.net.library/middleware/use-pagination-query-parameters";
import { UseUIMenuStateCookieOptions, useUIMenuStateCookie } from "@tw050x.net.library/middleware/use-ui-menu-state-cookie";
import { UseUIUserTableToolsStateCookieOptions, useUIUserTableToolsStateCookie } from "@tw050x.net.library/middleware/use-ui-user-table-tools-state-cookie";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { useAuthGate } from "../../../middleware/use-auth-gate.js";
import { default as Assignment, Props as AssignmentDocumentProps } from "../../../template/document/Assignment.js";
import { AssignmentTaskWithTemplate } from "../../../template/component/AssignmentTaskTable.js";
import { serviceParameters } from "../../../parameters.js";
import { serviceSecrets } from "../../../secrets.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
  allowedOrigins: serviceParameters.getParameter('portal.service.allowed-origins'),
};

const usePaginationQueryParametersOptions: UsePaginationQueryParametersOptions = {
  defaultPageIndex: serviceParameters.getParameter('portal.service.assignment-query-parameters.default-page-index'),
  defaultPageSize: serviceParameters.getParameter('portal.service.assignment-query-parameters.default-page-size'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: serviceParameters.getParameter('cookie.access-token.name'),
  cookieDomain: serviceParameters.getParameter('cookie.access-token.domain'),
  requiredPermissions: [
    'read:portal:users-page',
  ],
  jwtSecretKey: serviceSecrets.getSecret('jwt.secret-key'),
}

const useLoginStateCookieOptions: UseLoginStateCookieOptions = {
  cookieName: serviceParameters.getParameter('cookie.login-state.name'),
  cookieDomain: serviceParameters.getParameter('cookie.login-state.domain'),
  encrypterSecretKey: serviceSecrets.getSecret('encrypter.secret-key'),
}

const useUIMenuStateCookieOptions: UseUIMenuStateCookieOptions = {
  cookieName: serviceParameters.getParameter('cookie.ui.menu.state.name'),
}

const useUIUserTableToolsStateCookieOptions: UseUIUserTableToolsStateCookieOptions = {
  cookieName: serviceParameters.getParameter('cookie.ui.user-table-tools.state.name'),
  cookieDomain: serviceParameters.getParameter('cookie.ui.user-table-tools.state.domain'),
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

  // handle request
  async (context) => {
    let assignmentTasks;
    try {
      assignmentTasks = await assignmentDatabase.task.aggregate<AssignmentTaskWithTemplate>(
        sanitizeMongoDBFilterOrPipeline([
          {
            $match: {
              userProfileUuid: context.incomingMessage.accessTokenCookie.payload.sub,
              completed: false,
            }
          },
          {
            $limit: context.incomingMessage.query.parameters.pageSize,
          },
          {
            $skip: context.incomingMessage.query.parameters.pageIndex * context.incomingMessage.query.parameters.pageSize,
          }
        ])
      )
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
    }

    // fetch tasks from database
    let tasks: Array<AssignmentTaskWithTemplate> = [];
    try {
      tasks = await assignmentTasks.toArray();
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
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
    return void context.serverResponse.sendOKHTMLResponse(<Assignment {...assignmentDocumentProps} />);
  }
]);
