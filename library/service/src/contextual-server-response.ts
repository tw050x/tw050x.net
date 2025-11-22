import { renderToStream } from "@kitajs/html/suspense";
import { ServerResponse } from "node:http";
import { default as ContextualIncomingMessage } from "./contextual-incoming-message.js";

/**
 * ContextualServerResponse class that extends the ServerResponse class
 * to provide additional methods for sending various types of HTTP responses.
 */
export default class ContextualServerResponse extends ServerResponse<ContextualIncomingMessage> {

  /**
   * Creates an instance of the ContextualServerResponse class.
   * @param request
   */
  constructor(request: ContextualIncomingMessage) {
    super(request);
    // TODO: consider only storing specific headers like the 'hx-request' header
    this._incomingMessageHeaders = request.headers;
  }

  /**
   * The headers from the incoming message.
   */
  private _incomingMessageHeaders: ContextualIncomingMessage['headers'];

  /**
   * Indicates whether the server response is currently being sent or has already been sent.
   */
  private _serverResponseSendingOrSent: boolean = false;

  /**
   * Indicates whether the server response is currently being sent or has already been sent.
   */
  get sendingOrSent(): boolean {
    return this._serverResponseSendingOrSent;
  }

  /**
   * Sends a 202 Accepted response with a JSON message
   *
   */
  sendAcceptedJSONResponse(): void {
    this.statusCode = 202;
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify({
      message: 'accepted'
    }));
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 400 Bad Request response with the provided HTML content
   *
   * @param jsxElement The JSX element to render as the response body
   */
  sendBadRequestHTMLResponse(jsxElement: JSX.Element): void {
    this.statusCode = 400;
    this.setHeader('Content-Type', 'text/html');
    renderToStream(jsxElement).pipe(this);
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 400 Bad Request response with a JSON message
   *
   */
  sendBadRequestJSONResponse(): void {
    this.statusCode = 400;
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify({
      message: 'bad request'
    }));
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 201 Created response with a JSON message
   *
   */
  sendCreatedJSONResponse(): void {
    this.statusCode = 201;
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify({
      message: 'created'
    }));
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 302 Found redirect response to the specified URL
   *
   * @param url The URL to redirect to
   */
  sendFoundRedirect(url: URL): void {
    this.statusCode = 302;
    this.setHeader('Content-Type', 'text/plain');
    this.setHeader(
      this._incomingMessageHeaders['hx-request'] === 'true' ? 'HX-Redirect' : 'Location',
      url.toString()
    );
    this.end('Redirecting...');
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 403 Forbidden response with the provided HTML content
   *
   * @param jsxElement The JSX element to render as the response body
   */
  sendForbiddenHTMLResponse(jsxElement: JSX.Element): void {
    this.statusCode = 403;
    this.setHeader('Content-Type', 'text/html');
    renderToStream(jsxElement).pipe(this);
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 403 Forbidden response with a JSON message
   *
   * @param text Optional text to include in the response body
   */
  sendForbiddenTextResponse(text?: string): void {
    this.statusCode = 403;
    this.setHeader('Content-Type', 'text/plain');
    this.end(text || 'Forbidden');
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 403 Forbidden response with a JSON message
   *
   * @param jsxElement The JSX element to render as the response body
   */
  sendInternalServerErrorHTMLResponse(jsxElement: JSX.Element): void {
    this.statusCode = 500;
    this.setHeader('Content-Type', 'text/html');
    renderToStream(jsxElement).pipe(this);
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 500 Internal Server Error response with a JSON message
   *
   */
  sendInternalServerErrorJSONResponse(): void {
    this.statusCode = 500;
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify({
      message: 'internal server error'
    }));
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 500 Internal Server Error response with optional text
   *
   * @param text Optional text to include in the response body
   */
  sendInternalServerErrorTextResponse(text?: string): void {
    this.statusCode = 500;
    this.setHeader('Content-Type', 'text/plain');
    this.end(text || 'Internal Server Error');
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 301 Moved Permanently redirect response to the specified URL
   *
   * @param url The URL to redirect to
   */
  sendMovedPermanentlyRedirect(url: URL): void {
    this.statusCode = 301;
    this.setHeader('Content-Type', 'text/plain');
    this.setHeader(
      this._incomingMessageHeaders['hx-request'] === 'true' ? 'HX-Redirect' : 'Location',
      url.toString()
    );
    this.end(`Moved Permanently to ${url.toString()}`);
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 302 Moved Temporarily redirect response to the specified URL
   *
   * @param url The URL to redirect to
   */
  sendMovedTemporarilyRedirect(url: URL): void {
    this.statusCode = 302;
    this.setHeader('Content-Type', 'text/plain');
    this.setHeader(
      this._incomingMessageHeaders['hx-request'] === 'true' ? 'HX-Redirect' : 'Location',
      url.toString()
    );
    this.end(`Moved Temporarily to ${url.toString()}`);
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 204 No Content response with optional text
   *
   * @param text Optional text to include in the response body
   */
  sendNoContentTextResponse(text?: string): void {
    this.statusCode = 204;
    this.setHeader('Content-Type', 'text/plain');
    this.end(text || 'No Content');
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 404 Not Found response with the provided HTML content
   *
   * @param jsxElement The JSX element to render as the response body
   */
  sendNotFoundHTMLResponse(jsxElement: JSX.Element): void {
    this.statusCode = 404;
    this.setHeader('Content-Type', 'text/html');
    renderToStream(jsxElement).pipe(this);
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 404 Not Found response with a JSON message
   *
   */
  sendNotFoundJSONResponse(): void {
    this.statusCode = 404;
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify({
      message: 'not found'
    }));
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 501 Not Implemented response with optional text
   *
   * @param text Optional text to include in the response body
   */
  sendNotImplementedTextResponse(text?: string): void {
    this.statusCode = 501;
    this.setHeader('Content-Type', 'text/plain');
    this.end(text || 'Not Implemented');
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 200 OK response with the provided HTML content
   *
   * @param jsxElement The JSX element to render as the response body
   */
  sendOKHTMLResponse(jsxElement: JSX.Element): void {
    this.statusCode = 200;
    this.setHeader('Content-Type', 'text/html');
    renderToStream(jsxElement).pipe(this);
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 200 OK response with a JSON message
   *
   */
  sendOKJSONResponse(): void {
    this.statusCode = 200;
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify({
      message: 'ok'
    }));
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 200 OK response with optional text
   *
   * @param text Optional text to include in the response body
   */
  sendOKTextResponse(text?: string): void {
    this.statusCode = 200;
    this.setHeader('Content-Type', 'text/plain');
    this.end(text || 'ok');
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 303 See Other redirect response to the specified URL
   *
   * @param url The URL to redirect to
   */
  sendSeeOtherRedirect(url: URL): void {
    this.statusCode = 303;
    this.setHeader('Content-Type', 'text/plain');
    this.setHeader(
      this._incomingMessageHeaders['hx-request'] === 'true' ? 'HX-Redirect' : 'Location',
      url.toString()
    );
    this.end('Redirecting...');
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 401 Unauthorized response with the provided HTML content
   *
   * @param jsxElement The JSX element to render as the response body
   */
  sendUnauthorizedHTMLResponse(jsxElement: JSX.Element): void {
    this.statusCode = 401;
    this.setHeader('Content-Type', 'text/html');
    renderToStream(jsxElement).pipe(this);
    this._serverResponseSendingOrSent = true;
  }

  /**
   * Sends a 401 Unauthorized response with a JSON message
   *
   */
  sendUnauthorizedJSONResponse(): void {
    this.statusCode = 401;
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify({
      message: 'unauthorized'
    }));
    this._serverResponseSendingOrSent = true;
  }
}
