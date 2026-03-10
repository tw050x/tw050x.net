# Configs

Local development defaults are versioned in `.configs/defaults`.

To initialize missing local config files, run:

```bash
yarn setup
```

> We do not include the `oauth2....` values as we do not wish to open ourselves up to the potential issues of doing so. When running the setup script you will need to request these values from another developer.

Below is a list of all required configs within the platform:

- `cookie.*.domain`: The domain for the cookie.
- `cors.*.allowed-origins`: A comma separated list of allowed origins for CORS.
- `logs.directory`: The directory where logs are stored.
- `logs.level`: The logging level.
- `mongo.client.uri`: The connection URI for the MongoDB client.
- `mongo.client.auth-username`: The username for authenticating with the MongoDB client.
- `mongo.server.replica-set`: The replica set name for the MongoDB server.
- `oauth2.google.client-id`: The client ID for Google OAuth2 authentication.
- `oauth2.google.redirect-uri`: The redirect URI for Google OAuth2 authentication.
- `service.*.host`: The host address for the service.
- `service.*.login-enabled`: A boolean flag indicating if login is enabled for the service.
- `service.*.registration-enabled`: A boolean flag indicating if registration is enabled for the service.
- `service.portal.default-assignment-query-parameters-page-index`: The default page index for assignment queries in the portal.
- `service.portal.default-assignment-query-parameters-page-size`: The default page size for assignment
