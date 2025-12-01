declare const htmx: typeof import("htmx.org").default;
type HtmxResponseInfo = import("htmx.org").HtmxResponseInfo;
type HtmxResponseErrorEvent = CustomEvent<HtmxResponseInfo>

document.body.addEventListener('htmx:responseError', async (event) => {
  const eventTarget = event.target;

  if (eventTarget === null) {
    console.error(new Error('htmx:responseError event target is null'));
    return void location.assign('{{LOGIN_URL}}');
  }

  const typedEvent = event as HtmxResponseErrorEvent;

  unauthorisedGuard: {
    if (typedEvent.detail.xhr.status !== 401) {
      break unauthorisedGuard;
    }

    try {
      const response = await fetch('{{REFRESH_TOKEN_URL}}', {
        method: 'POST',
      });

      if (response.ok === false) {
        console.debug('Failed to refresh session, redirecting to login');
        return void location.assign('{{LOGIN_URL}}');
      }

      htmx.trigger(eventTarget, 'htmx:confirm');
    }
    catch (error) {
      console.error(error);
      console.debug('There has been a problem with refreshing the session, redirecting to login');
      return void location.assign('{{LOGIN_URL}}');
    }
  }

  console.debug(`htmx:responseError received with status code ${typedEvent.detail.xhr.status}`);
});
