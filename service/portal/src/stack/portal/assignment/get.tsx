import { collectionMeta as assignmentCollectionMeta, database as assignmentDatabase } from "@tw050x.net.database/assignment";
import { UseAccessTokenCookieOptions, useAccessTokenCookie } from "@tw050x.net.library/authentication/use-access-token-cookie";
import { UseLoginStateCookieOptions, useLoginStateCookie } from "@tw050x.net.library/authentication/use-login-state-cookie";
import { useParameter } from "@tw050x.net.library/configuration";
import { sanitizeMongoDBFilterOrPipeline } from "@tw050x.net.library/database";
import { logger } from "@tw050x.net.library/logger";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { UsePaginationQueryParametersOptions, usePaginationQueryParameters } from "@tw050x.net.library/middleware/use-pagination-query-parameters";
import { UseUIMenuStateCookieOptions, useUIMenuStateCookie } from "@tw050x.net.library/middleware/use-ui-menu-state-cookie";
import { UseUIUserTableToolsStateCookieOptions, useUIUserTableToolsStateCookie } from "@tw050x.net.library/middleware/use-ui-user-table-tools-state-cookie";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/middleware/use-cors-headers";
import { useSecret } from "@tw050x.net.library/secret";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { z } from "zod";
import { useAuthGate } from "../../../middleware/use-auth-gate.js";
import { default as Assignment, Props as AssignmentDocumentProps } from "../../../template/document/Assignment.js";
import { AssignmentTaskWithTemplate } from "../../../template/component/AssignmentTaskTable.js";

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

  // handle request
  async (context) => {
    let assignmentTasksTemplate;

    // console.log('context.incomingMessage.query', context.incomingMessage.query)

    try {
      assignmentTasksTemplate = await assignmentDatabase.task.aggregate<AssignmentTaskWithTemplate>(
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
          },
          {
            $lookup: {
              from: assignmentCollectionMeta.taskTemplate.name,
              localField: 'assignmentTaskTemplateUuid',
              foreignField: 'uuid',
              as: 'template'
            }
          },
          {
            $unwind: {
              path: '$template',
              preserveNullAndEmptyArrays: true
            }
          }
        ])
      )
    }
    catch (error) {
      logger.error(error);
      return void context.serverResponse.sendInternalServerErrorHTMLResponse(<UnrecoverableDocument />);
    }

    //
    let tasks: Array<AssignmentTaskWithTemplate> = [];
    try {
      tasks = await assignmentTasksTemplate.toArray();
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
