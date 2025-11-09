# The Environment Files

To run a development environment you will need to create the necessary environment files. The list below shows the files required and their contents.

## Files

- .env.aws
- .env.database.assignment
- .env.database.user
- .env.mongo
- .env.service.error
- .env.service.localstack
- .env.service.marketing
- .env.service.navigation
- .env.service.portal
- .env.service.traefik
- .env.service.user
- .env.services.logs
- .env.services.mongo-client
- .env.worker.user-service-queue
- .env.workers.logs
- .env.workers.mongo-client

> Environment files should not be tracked in versions control.

## File Contents

### .env.aws

| Filename | Key                   | Description                                                                    |
| -------- | --------------------- | ------------------------------------------------------------------------------ |
| .env.aws | AWS_ENDPOINT          | Endpoint for AWS services. Used when running localstack                        |
| .env.aws | AWS_ACCESS_KEY_ID     | Access key for AWS services, Can be set to a dummy value when using localstack |
| .env.aws | AWS_SECRET_ACCESS_KEY | Secret key for AWS services, Can be set to a dummy value when using localstack |
| .env.aws | AWS_REGION            | AWS region to use                                                              |

### .env.database.assignment

| Filename                 | Key                                               | Description                                                      |
| ------------------------ | ------------------------------------------------- | ---------------------------------------------------------------- |
| .env.database.assignment | ASSIGNMENT_DATABASE_NAME                          | Name of the assignment database                                  |
| .env.database.assignment | ASSIGNMENT_DATABASE_TASK_COLLECTION_NAME          | Name of the tasks collection in the assignment database          |
| .env.database.assignment | ASSIGNMENT_DATABASE_TASK_TEMPLATE_COLLECTION_NAME | Name of the task templates collection in the assignment database |

### .env.database.user

| Filename           | Key                                       | Description                                             |
| ------------------ | ----------------------------------------- | ------------------------------------------------------- |
| .env.database.user | USER_DATABASE_NAME                        | Name of the user database                               |
| .env.database.user | USER_DATABASE_CREDENTIALS_COLLECTION_NAME | Name of the credentials collection in the user database |
| .env.database.user | USER_DATABASE_NONCES_COLLECTION_NAME      | Name of the nonces collection in the user database      |
| .env.database.user | USER_DATABASE_PERMISSIONS_COLLECTION_NAME | Name of the permissions collection in the user database |
| .env.database.user | USER_DATABASE_PROFILE_COLLECTION_NAME     | Name of the profile collection in the user database     |

### .env.service.assets

| Filename            | Key      | Description                                      |
| ------------------- | -------- | ------------------------------------------------ |
| .env.service.assets | NODE_ENV | Node environment (development, production, etc.) |

### .env.service.error

| Filename           | Key      | Description                                      |
| ------------------ | -------- | ------------------------------------------------ |
| .env.service.error | NODE_ENV | Node environment (development, production, etc.) |

### .env.service.localstack

| Filename                | Key             | Description                           |
| ----------------------- | --------------- | ------------------------------------- |
| .env.service.localstack | DEBUG           | Enable debug mode (0, 1)              |
| .env.service.localstack | PERSIST_DEFAULT | Enable persistence for default (0, 1) |
| .env.service.localstack | PERSIST_SSM     | Enable persistence for SSM (0, 1)     |
| .env.service.localstack | PERSIST_SQS     | Enable persistence for SQS (0, 1)     |

### .env.service.marketing

| Filename               | Key      | Description                                      |
| ---------------------- | -------- | ------------------------------------------------ |
| .env.service.marketing | NODE_ENV | Node environment (development, production, etc.) |

### .env.service.mongo

| Filename           | Key                        | Description              |
| ------------------ | -------------------------- | ------------------------ |
| .env.service.mongo | MONGO_INITDB_ROOT_USERNAME | MongoDB root username    |
| .env.service.mongo | MONGO_INITDB_ROOT_PASSWORD | MongoDB root password    |
| .env.service.mongo | MONGO_REPLICA_SET_NAME     | MongoDB replica set name |

### .env.service.navigation

| Filename                | Key      | Description                                      |
| ----------------------- | -------- | ------------------------------------------------ |
| .env.service.navigation | NODE_ENV | Node environment (development, production, etc.) |

### .env.service.portal

| Filename            | Key      | Description                                      |
| ------------------- | -------- | ------------------------------------------------ |
| .env.service.portal | NODE_ENV | Node environment (development, production, etc.) |

### .env.service.traefik

| Filename             | Key        | Description                                                          |
| -------------------- | ---------- | -------------------------------------------------------------------- |
| .env.service.traefik | CONTAINERS | Enables container access endpoints for traefik's docker socket proxy |
| .env.service.traefik | SERVICES   | Enables services access endpoints for traefik's docker socket proxy  |
| .env.service.traefik | TASKS      | Enables tasks access endpoints for traefik's docker socket proxy     |
| .env.service.traefik | NETWORKS   | Enables networks access endpoints for traefik's docker socket proxy  |

### .env.service.user

| Filename          | Key                                           | Description                                        |
| ----------------- | --------------------------------------------- | -------------------------------------------------- |
| .env.service.user | NODE_ENV                                      | Node environment (development, production, etc.)   |
| .env.service.user | ASSIGNMENT_TEMPLATE_UUID_ENTER_YOUR_NAME_TASK | UUID for the "Enter Your Name" assignment template |
| .env.service.user | ASSIGNMENT_TEMPLATE_UUID_VERIFY_EMAIL_TASK    | UUID for the "Verify Email" assignment template    |

### .env.services.logs

| Filename           | Key            | Description                              |
| ------------------ | -------------- | ---------------------------------------- |
| .env.services.logs | LOGS_LEVEL     | Logging level (debug, info, warn, error) |
| .env.services.logs | LOGS_DIRECTORY | Directory for log files                  |

### .env.services.mongo-client

| Filename                   | Key                        | Description                            |
| -------------------------- | -------------------------- | -------------------------------------- |
| .env.services.mongo-client | MONGO_CLIENT_AUTH_PASSWORD | MongoDB client authentication password |
| .env.services.mongo-client | MONGO_CLIENT_AUTH_USERNAME | MongoDB client authentication username |
| .env.services.mongo-client | MONGO_CLIENT_REPLICA_SET   | MongoDB client replica set name        |
| .env.services.mongo-client | MONGO_CLIENT_URI           | MongoDB client connection URI          |

### .env.worker.user-service-queue

| Filename                       | Key      | Description                                      |
| ------------------------------ | -------- | ------------------------------------------------ |
| .env.worker.user-service-queue | NODE_ENV | Node environment (development, production, etc.) |

### .env.workers.logs

| Filename          | Key            | Description                              |
| ----------------- | -------------- | ---------------------------------------- |
| .env.workers.logs | LOGS_LEVEL     | Logging level (debug, info, warn, error) |
| .env.workers.logs | LOGS_DIRECTORY | Directory for log files                  |

### .env.workers.mongo-client

| Filename                  | Key                        | Description                            |
| ------------------------- | -------------------------- | -------------------------------------- |
| .env.workers.mongo-client | MONGO_CLIENT_AUTH_PASSWORD | MongoDB client authentication password |
| .env.workers.mongo-client | MONGO_CLIENT_AUTH_USERNAME | MongoDB client authentication username |
| .env.workers.mongo-client | MONGO_CLIENT_REPLICA_SET   | MongoDB client replica set name        |
| .env.workers.mongo-client | MONGO_CLIENT_URI           | MongoDB client connection URI          |
