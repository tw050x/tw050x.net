import { Middleware, ServiceRequestContext } from "@tw050x.net.library/service";
import { Agent, request} from "node:https";
import { readFileSync } from "fs";

/**
 * Authorisation
 */
export type Authorisation = {
  isAuthorised: (userProfileUuid: string, resource: string, action: string) => Promise<boolean>;
}

/**
 * Options for the useAuthorisation middleware
 */
export type UseAuthorisationOptions = {
  authorisationServiceDomain: string;
  authorisationServicePort: string;
  mTLSOptions: {
    caPath: string;
    crtPath: string;
    keyPath: string;
  };
}

/**
 * Resulting context after the useAuthorisation middleware has run
 */
export type UseAuthorisationResultingContext = ServiceRequestContext & {
  incomingMessage: ServiceRequestContext['incomingMessage'] & {
    authorisation: Authorisation;
  }
}

/**
 * Factory type for the useAuthorisation middleware
 */
type Factory = (options: UseAuthorisationOptions) => Middleware<
  ServiceRequestContext,
  UseAuthorisationResultingContext
>;

/**
 * @returns void
 */
export const useAuthorisation: Factory = (options) => {
  const caCert = readFileSync(options.mTLSOptions.caPath, 'utf-8');
  const clientCert = readFileSync(options.mTLSOptions.crtPath, 'utf-8');
  const clientKey = readFileSync(options.mTLSOptions.keyPath, 'utf-8');

  const agent = new Agent({
    ca: caCert,
    cert: clientCert,
    key: clientKey,
  });

  const authorisationServiceURL = new URL('/authorise', `https://${options.authorisationServiceDomain}:${options.authorisationServicePort}`);

  return async (context) => {

    const isAuthorised = async (userProfileUuid: string, resource: string, action: string): Promise<boolean> => {
      let postData = JSON.stringify({
        userProfileUuid,
        resource,
        action,
      });

      const requestOptions = {
        hostname: authorisationServiceURL.hostname,
        port: authorisationServiceURL.port,
        path: '/authorise',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
        agent,
      };

      return new Promise<boolean>((resolve, reject) => {
        const r = request(requestOptions, (response) => {
          let data = '';

          response.on('data', (chunk) => {
            data += chunk;
          });

          response.on('end', () => {
            const parsedData = JSON.parse(data);
            if (parsedData === true || parsedData === 'true') resolve(true);
            else resolve(false);
          });
        });

        r.on('error', reject);
        r.write(postData);
        r.end();
      });
    }

    context.incomingMessage.authorisation = {
      isAuthorised,
    };
  }
}
