# The Environment Files

To run a development environment you will need to create the necessary environment files. The list below shows the files required and their contents.

## Files

- .env.aws
- .env.database.authentication
- .env.database.user
- .env.localstack
- .env.logs
- .eng.mongo
- .env.mongo-client
- .env.service.authentication
- .env.service.error
- .env.service.marketing
- .env.service.navigation
- .env.service.portal
- .env.service.user
- .env.traefik

> Environment files should not be tracked in versions control.

## File Contents

TODO: Add example contents for each file.

### .env.aws

| Filename | Key | Description |
|---|---|--|
| .env.aws | AWS_ENDPOINT | Endpoint for AWS services. Used when running localstack |
| .env.aws | AWS_ACCESS_KEY_ID | Access key for AWS services, Can be set to a dummy value when using localstack |
| .env.aws | AWS_SECRET_ACCESS_KEY | Secret key for AWS services, Can be set to a dummy value when using localstack |
| .env.aws | AWS_REGION | AWS region to use |

### .env.authentication

| Filename | Key | Description |
|---|---|--|
| .env.authentication | AUTHENTICATION_DATABASE_NAME | Name of the authentication database |
| .env.authentication | AUTHENTICATION_DATABASE_NONCES_COLLECTION_NAME | Name of the nonces collection in the authentication database |
