import { logger } from "@tw050x.net.library/logger";
import { useCors } from "@tw050x.net.library/middleware/use-cors"
import { defineServiceMiddleware } from "@tw050x.net.library/service";
import { getFormDataBody } from "@tw050x.net.library/service/helper";
import { sendOKHTMLResponse } from "@tw050x.net.library/service/helper/response/send-ok-html-response";
import { sendOKJSONResponse } from "@tw050x.net.library/service/helper/response/send-ok-json-response";

export default defineServiceMiddleware([
  async (context) => {
    logger.debug(`POST ${context.incomingMessage.url}`);
  },
  useCors({
    getConfiguration: async (configuration) => ({
      allowedMethods: ['GET', 'OPTIONS', 'POST'],
      allowedOrigins: configuration.get('user.service.allowed-origins')
    })
  }),

  // Render the registration page in a disabled if it is not enabled
  async (context) => {
    const registrationEnabled = context.configuration.get('user.service.registration-enabled');
    if (registrationEnabled === 'false') {
      return void sendOKJSONResponse(context, { message: 'Registration is currently disabled' });
    }
  },

  // Handle the registration form submission
  async (context) => {

    const data = await getFormDataBody(context);

    console.log(data);


    // TODO: Implement user registration logic here
    return sendOKHTMLResponse(context, await <div>User registered successfully</div>);
  }
])
