# The Environment Files

> Note: Most environment files are being phased out due to the amount of files needed. They will be replaced with a more manageable solution in the future. This does not mean that environment files will be removed entirely, just reduced in number.

To run a development environment you will need to create the necessary environment files. The list below shows the files required and their contents.

## Files

- .env.database.account
- .env.database.assignment
- .env.database.authorisation
- .env.database.payment
- .env.database.user
- .env.migration.mongo
- .env.service.assets
- .env.service.authorisation
- .env.service.error
- .env.service.marketing
- .env.service.mongo
- .env.service.navigation
- .env.service.portal
- .env.service.rabbitmq
- .env.service.traefik
- .env.service.user
- .env.services.logs
- .env.services.mongo-client
- .env.services.rabbitmq-client
- .env.worker.user-service-queue
- .env.workers.logs
- .env.workers.mongo-client

> Environment files should not be tracked in versions control.

## File Contents

### .env.database.account

| Filename              | Key                                         | Description                                               |
| --------------------- | ------------------------------------------- | --------------------------------------------------------- |
| .env.database.account | ACCOUNT_DATABASE_NAME                       | Name of the account database                              |
| .env.database.account | ACCOUNT_DATABASE_BILLING_COLLECTION_NAME    | Name of the billing collection in the account database    |
| .env.database.account | ACCOUNT_DATABASE_INVITATION_COLLECTION_NAME | Name of the invitation collection in the account database |
| .env.database.account | ACCOUNT_DATABASE_MEMBERSHIP_COLLECTION_NAME | Name of the membership collection in the account database |
| .env.database.account | ACCOUNT_DATABASE_PROFILE_COLLECTION_NAME    | Name of the profile collection in the account database    |

### .env.database.assignment

| Filename                 | Key                                               | Description                                                      |
| ------------------------ | ------------------------------------------------- | ---------------------------------------------------------------- |
| .env.database.assignment | ASSIGNMENT_DATABASE_NAME                          | Name of the assignment database                                  |
| .env.database.assignment | ASSIGNMENT_DATABASE_TASK_COLLECTION_NAME          | Name of the tasks collection in the assignment database          |
| .env.database.assignment | ASSIGNMENT_DATABASE_TASK_TEMPLATE_COLLECTION_NAME | Name of the task templates collection in the assignment database |

### .env.database.authorisation

| Filename                    | Key                                            | Description                                                      |
| --------------------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| .env.database.authorisation | ASSIGNMENT_DATABASE_NAME                       | Name of the authorisation database                               |
| .env.database.authorisation | ASSIGNMENT_DATABASE_PERMISSION_COLLECTION_NAME | Name of the permissions collection in the authorisation database |

### .env.database.payment

| Filename              | Key                                     | Description                                           |
| --------------------- | --------------------------------------- | ----------------------------------------------------- |
| .env.database.payment | ASSIGNMENT_DATABASE_NAME                | Name of the payment database                          |
| .env.database.payment | PAYMENT_DATABASE_NONCES_COLLECTION_NAME | Name of the nonces collection in the payment database |

### .env.database.user

| Filename           | Key                                       | Description                                             |
| ------------------ | ----------------------------------------- | ------------------------------------------------------- |
| .env.database.user | USER_DATABASE_NAME                        | Name of the user database                               |
| .env.database.user | USER_DATABASE_CREDENTIALS_COLLECTION_NAME | Name of the credentials collection in the user database |
| .env.database.user | USER_DATABASE_NONCES_COLLECTION_NAME      | Name of the nonces collection in the user database      |
| .env.database.user | USER_DATABASE_PERMISSIONS_COLLECTION_NAME | Name of the permissions collection in the user database |
| .env.database.user | USER_DATABASE_PROFILE_COLLECTION_NAME     | Name of the profile collection in the user database     |

### .env.migration.mongo

| Filename             | Key                     | Description           |
| -------------------- | ----------------------- | --------------------- |
| .env.migration.mongo | MONGO_DATABASE_USERNAME | MongoDB username      |
| .env.migration.mongo | MONGO_DATABASE_PASSWORD | MongoDB password      |
| .env.migration.mongo | MONGO_DATABASE_HOST     | MongoDB database host |
| .env.migration.mongo | MONGO_DATABASE_PORT     | MongoDB database port |

### .env.service.assets

| Filename            | Key      | Description                                      |
| ------------------- | -------- | ------------------------------------------------ |
| .env.service.assets | NODE_ENV | Node environment (development, production, etc.) |

### .env.service.authorisation

| Filename                   | Key      | Description                                      |
| -------------------------- | -------- | ------------------------------------------------ |
| .env.service.authorisation | NODE_ENV | Node environment (development, production, etc.) |

### .env.service.error

| Filename           | Key      | Description                                      |
| ------------------ | -------- | ------------------------------------------------ |
| .env.service.error | NODE_ENV | Node environment (development, production, etc.) |

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

### .env.services.rabbitmq-client

| Filename                      | Key               | Description                             |
| ----------------------------- | ----------------- | --------------------------------------- |
| .env.services.rabbitmq-client | RABBITMQ_USER     | RabbitMQ client authentication password |
| .env.services.rabbitmq-client | RABBITMQ_PASSWORD | RabbitMQ client authentication username |
| .env.services.rabbitmq-client | RABBITMQ_HOST     | RabbitMQ client host                    |
| .env.services.rabbitmq-client | RABBITMQ_PORT     | RabbitMQ client port                    |
| .env.services.rabbitmq-client | RABBITMQ_VHOST    | RabbitMQ client virtual host            |

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
