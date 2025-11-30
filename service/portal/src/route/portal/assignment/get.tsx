import { database as assignmentDatabase } from "@tw050x.net.database/assignment";
import { read as readConfig } from "@tw050x.net.library/configs";
import { sanitizeMongoDBFilterOrPipeline } from "@tw050x.net.library/database";
import { logger } from "@tw050x.net.library/logger";
import { useLogRequest } from "@tw050x.net.library/middleware/use-log-request";
import { UsePaginationQueryParametersOptions, usePaginationQueryParameters } from "@tw050x.net.library/middleware/use-pagination-query-parameters";
import { UseCorsHeadersFactoryOptions, useCorsHeaders } from "@tw050x.net.library/cors/use-cors-headers";
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { useSession } from "@tw050x.net.library/sessions/middleware/use-session";
import { useSessionGate } from "@tw050x.net.library/sessions/middleware/use-session-gate";
import { default as UnrecoverableDocument } from "@tw050x.net.library/uikit/document/Unrecoverable";
import { useLoginState } from "@tw050x.net.library/user/middleware/use-login-state";
import { useUIStateCookie } from "../../../middleware/use-ui-state.js";
import { default as Assignment, Props as AssignmentDocumentProps } from "../../../template/document/Assignment.js";
import { AssignmentTaskWithTemplate } from "../../../template/component/AssignmentTaskTable.js";

const useCorsHeadersOptions: UseCorsHeadersFactoryOptions = {
  allowedMethods: ['GET', 'OPTIONS'],
};

const usePaginationQueryParametersOptions: UsePaginationQueryParametersOptions = {
  defaultPageIndex: readConfig('service.portal.default-assignment-query-parameters-page-index'),
  defaultPageSize: readConfig('service.portal.default-assignment-query-parameters-page-size'),
}

export default defineServiceMiddleware([
  useLogRequest(),
  useCorsHeaders(useCorsHeadersOptions),
  useLoginState(),
  useSession({
    activity: 'get-portal-assignment-route',
  }),
  useSessionGate(),
  usePaginationQueryParameters(usePaginationQueryParametersOptions),
  useUIStateCookie(),

  // handle request
  async (context) => {

    let assignmentTasks;
    try {
      assignmentTasks = await assignmentDatabase.task.aggregate<AssignmentTaskWithTemplate>(
        sanitizeMongoDBFilterOrPipeline([
          {
            $match: {
              completed: false,
              userProfileUuid: context.incomingMessage.session.userProfileUuid,
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
