import { database as assignmentDatabase } from "@tw050x.net.database/assignment";
import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/authentication/middleware/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/authentication/middleware/use-login-state-cookie";
import { read as readConfig } from "@tw050x.net.library/configs";
import { sanitizeMongoDBFilterOrPipeline } from "@tw050x.net.library/database";
import { logger } from "@tw050x.net.library/logger";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { UsePaginationQueryParametersOptions, usePaginationQueryParameters } from "@tw050x.net.library/middleware/use-pagination-query-parameters";
import { UseUIStateCookieOptions, useUIStateCookie } from "../../../middleware/use-ui-state.js";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { read as readSecret } from "@tw050x.net.library/secrets";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { useAuthGate } from "../../../middleware/use-auth-gate.js";
import { default as Assignment, Props as AssignmentDocumentProps } from "../../../template/document/Assignment.js";
import { AssignmentTaskWithTemplate } from "../../../template/component/AssignmentTaskTable.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
  allowedOrigins: readConfig('service.portal.allowed-origins'),
};

const usePaginationQueryParametersOptions: UsePaginationQueryParametersOptions = {
  defaultPageIndex: readConfig('service.portal.assignment-query-parameters.default-page-index'),
  defaultPageSize: readConfig('service.portal.assignment-query-parameters.default-page-size'),
}

const useAccessTokenCookieOptions: UseAccessTokenCookieOptions = {
  cookieName: readConfig('cookie.access-token.name'),
  cookieDomain: readConfig('cookie.access-token.domain'),
  requiredPermissions: [
    'read:portal:users-page',
  ],
  jwtSecretKey: readSecret('jwt.secret-key'),
}

const useLoginStateCookieOptions: UseLoginStateCookieOptions = {
  cookieName: readConfig('cookie.login-state.name'),
  cookieDomain: readConfig('cookie.login-state.domain'),
  encrypterSecretKey: readSecret('encrypter.secret-key'),
}

const useUIStateCookieOptions: UseUIStateCookieOptions = {
  cookieName: readConfig('cookie.ui.portal.state.name'),
  cookieDomain: readConfig('cookie.ui.portal.state.domain'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useAccessTokenCookie(useAccessTokenCookieOptions),
  useLoginStateCookie(useLoginStateCookieOptions),
  useAuthGate(),
  usePaginationQueryParameters(usePaginationQueryParametersOptions),
  useUIStateCookie(useUIStateCookieOptions),

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
        state: context.incomingMessage.uiStateCookie.state.menu.open ? 'open' : 'collapsed',
      }
    }
    return void context.serverResponse.sendOKHTMLResponse(<Assignment {...assignmentDocumentProps} />);
  }
]);
