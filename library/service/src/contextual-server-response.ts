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
   *
   */
  get sendingOrSent(): boolean {
    return this._serverResponseSendingOrSent;
  }

  /**
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
   *
   */
  sendBadRequestHTMLResponse(jsxElement: JSX.Element): void {
    this.statusCode = 400;
    this.setHeader('Content-Type', 'text/html');
    renderToStream(jsxElement).pipe(this);
    this._serverResponseSendingOrSent = true;
  }

  /**
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
   *
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
   *
   */
  sendForbiddenHTMLResponse(jsxElement: JSX.Element): void {
    this.statusCode = 403;
    this.setHeader('Content-Type', 'text/html');
    renderToStream(jsxElement).pipe(this);
    this._serverResponseSendingOrSent = true;
  }

  /**
   *
   */
  sendInternalServerErrorHTMLResponse(jsxElement: JSX.Element): void {
    this.statusCode = 500;
    this.setHeader('Content-Type', 'text/html');
    renderToStream(jsxElement).pipe(this);
    this._serverResponseSendingOrSent = true;
  }

  /**
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
   *
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
   *
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
   *
   */
  sendNotFoundHTMLResponse(jsxElement: JSX.Element): void {
    this.statusCode = 404;
    this.setHeader('Content-Type', 'text/html');
    renderToStream(jsxElement).pipe(this);
    this._serverResponseSendingOrSent = true;
  }

  /**
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
   *
   */
  sendNotImplementedTextResponse(text?: string): void {
    this.statusCode = 501;
    this.setHeader('Content-Type', 'text/plain');
    this.end(text || 'Not Implemented');
    this._serverResponseSendingOrSent = true;
  }

  /**
   *
   */
  sendOKHTMLResponse(jsxElement: JSX.Element): void {
    this.statusCode = 200;
    this.setHeader('Content-Type', 'text/html');
    renderToStream(jsxElement).pipe(this);
    this._serverResponseSendingOrSent = true;
  }

  /**
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
   *
   */
  sendOKTextResponse(text?: string): void {
    this.statusCode = 200;
    this.setHeader('Content-Type', 'text/plain');
    this.end(text || 'ok');
    this._serverResponseSendingOrSent = true;
  }

  /**
   *
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
   *
   */
  sendUnauthorizedHTMLResponse(jsxElement: JSX.Element): void {
    this.statusCode = 401;
    this.setHeader('Content-Type', 'text/html');
    renderToStream(jsxElement).pipe(this);
    this._serverResponseSendingOrSent = true;
  }

  /**
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
