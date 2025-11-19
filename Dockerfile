# Build Image
FROM node:23.11.1-alpine3.22 AS build
WORKDIR /build
COPY . /build

# Set arguments
ARG NODE_ENV=production

## Set the environment variables
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_ENV=build

## Install all dependencies (including development)
RUN yarn

## Build the project
RUN yarn workspaces foreach \
  --from @tw050x.net.service/authorisation-service \
  --from @tw050x.net.service/error-service \
  --from @tw050x.net.service/marketing-service \
  --from @tw050x.net.service/navigation-service \
  --from @tw050x.net.service/portal-service \
  --from @tw050x.net.service/user-service \
  --from @tw050x.net.worker/user-service-queue \
  --recursive \
  --topological \
  run tsc

FROM node:23.11.1-alpine3.22 AS dependencies
WORKDIR /srv
COPY .yarn /srv/.yarn
COPY .pnp.cjs /srv/.pnp.cjs
COPY .yarnrc.yml /srv/.yarnrc.yml
COPY package.json /srv/package.json
COPY yarn.lock /srv/yarn.lock

FROM node:23.11.1-alpine3.22 AS database-account-service
WORKDIR /srv
COPY --from=build /build/database/account-service/artifact /srv/database/account-service/artifact
COPY --from=build /build/database/account-service/package.json /srv/database/account-service/package.json
COPY --from=build /build/database/account-service/tsconfig.json /srv/database/account-service/tsconfig.json
FROM node:23.11.1-alpine3.22 AS database-assignment-service
WORKDIR /srv
COPY --from=build /build/database/assignment-service/artifact /srv/database/assignment-service/artifact
COPY --from=build /build/database/assignment-service/package.json /srv/database/assignment-service/package.json
COPY --from=build /build/database/assignment-service/tsconfig.json /srv/database/assignment-service/tsconfig.json
FROM node:23.11.1-alpine3.22 AS database-user-service
WORKDIR /srv
COPY --from=build /build/database/user-service/artifact /srv/database/user-service/artifact
COPY --from=build /build/database/user-service/package.json /srv/database/user-service/package.json
COPY --from=build /build/database/user-service/tsconfig.json /srv/database/user-service/tsconfig.json

FROM node:23.11.1-alpine3.22 AS library-authentication
WORKDIR /srv
COPY --from=build /build/library/authentication/artifact /srv/library/authentication/artifact
COPY --from=build /build/library/authentication/package.json /srv/library/authentication/package.json
COPY --from=build /build/library/authentication/tsconfig.json /srv/library/authentication/tsconfig.json

FROM node:23.11.1-alpine3.22 AS library-authorisation
WORKDIR /srv
COPY --from=build /build/library/authorisation/artifact /srv/library/authorisation/artifact
COPY --from=build /build/library/authorisation/package.json /srv/library/authorisation/package.json
COPY --from=build /build/library/authorisation/tsconfig.json /srv/library/authorisation/tsconfig.json

FROM node:23.11.1-alpine3.22 AS library-configs
WORKDIR /srv
COPY --from=build /build/library/configs/artifact /srv/library/configs/artifact
COPY --from=build /build/library/configs/package.json /srv/library/configs/package.json
COPY --from=build /build/library/configs/tsconfig.json /srv/library/configs/tsconfig.json

FROM node:23.11.1-alpine3.22 AS library-cors
WORKDIR /srv
COPY --from=build /build/library/cors/artifact /srv/library/cors/artifact
COPY --from=build /build/library/cors/package.json /srv/library/cors/package.json
COPY --from=build /build/library/cors/tsconfig.json /srv/library/cors/tsconfig.json

FROM node:23.11.1-alpine3.22 AS library-database
WORKDIR /srv
COPY --from=build /build/library/database/artifact /srv/library/database/artifact
COPY --from=build /build/library/database/package.json /srv/library/database/package.json
COPY --from=build /build/library/database/tsconfig.json /srv/library/database/tsconfig.json

FROM node:23.11.1-alpine3.22 AS library-encryption
WORKDIR /srv
COPY --from=build /build/library/encryption/artifact /srv/library/encryption/artifact
COPY --from=build /build/library/encryption/package.json /srv/library/encryption/package.json
COPY --from=build /build/library/encryption/tsconfig.json /srv/library/encryption/tsconfig.json

FROM node:23.11.1-alpine3.22 AS library-logger
WORKDIR /srv
COPY --from=build /build/library/logger/artifact /srv/library/logger/artifact
COPY --from=build /build/library/logger/package.json /srv/library/logger/package.json
COPY --from=build /build/library/logger/tsconfig.json /srv/library/logger/tsconfig.json

FROM node:23.11.1-alpine3.22 AS library-middleware
WORKDIR /srv
COPY --from=build /build/library/middleware/artifact /srv/library/middleware/artifact
COPY --from=build /build/library/middleware/package.json /srv/library/middleware/package.json
COPY --from=build /build/library/middleware/tsconfig.json /srv/library/middleware/tsconfig.json

FROM node:23.11.1-alpine3.22 AS library-secrets
WORKDIR /srv
COPY --from=build /build/library/secrets/artifact /srv/library/secrets/artifact
COPY --from=build /build/library/secrets/package.json /srv/library/secrets/package.json
COPY --from=build /build/library/secrets/tsconfig.json /srv/library/secrets/tsconfig.json

FROM node:23.11.1-alpine3.22 AS library-service
WORKDIR /srv
COPY --from=build /build/library/service/artifact /srv/library/service/artifact
COPY --from=build /build/library/service/package.json /srv/library/service/package.json
COPY --from=build /build/library/service/tsconfig.json /srv/library/service/tsconfig.json

FROM node:23.11.1-alpine3.22 AS library-types
WORKDIR /srv
COPY --from=build /build/library/types/artifact /srv/library/types/artifact
COPY --from=build /build/library/types/package.json /srv/library/types/package.json
COPY --from=build /build/library/types/tsconfig.json /srv/library/types/tsconfig.json

FROM node:23.11.1-alpine3.22 AS library-uikit
WORKDIR /srv
COPY --from=build /build/library/uikit/artifact /srv/library/uikit/artifact
COPY --from=build /build/library/uikit/package.json /srv/library/uikit/package.json
COPY --from=build /build/library/uikit/tsconfig.json /srv/library/uikit/tsconfig.json

FROM node:23.11.1-alpine3.22 AS library-utility
WORKDIR /srv
COPY --from=build /build/library/utility/artifact /srv/library/utility/artifact
COPY --from=build /build/library/utility/package.json /srv/library/utility/package.json
COPY --from=build /build/library/utility/tsconfig.json /srv/library/utility/tsconfig.json

FROM node:23.11.1-alpine3.22 AS assets-service
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=build /build/service/assets-service/public /srv/service/assets-service/public
COPY --from=build /build/service/assets-service/package.json /srv/service/assets-service/package.json
COPY --from=build /build/service/assets-service/serve.json /srv/service/assets-service/serve.json
RUN yarn workspaces focus --production @tw050x.net.service/assets-service --production
ENTRYPOINT [ "sh", "-c" ]
CMD [ "yarn workspace @tw050x.net.service/assets-service serve --config /srv/service/assets-service/serve.json --listen tcp://0.0.0.0:3000" ]

FROM node:23.11.1-alpine3.22 AS authorisation-service
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=library-configs /srv/library/configs /srv/library/configs
COPY --from=library-cors /srv/library/cors /srv/library/cors
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-secrets /srv/library/secrets /srv/library/secrets
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-types /srv/library/types /srv/library/types
COPY --from=library-utility /srv/library/utility /srv/library/utility
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
COPY --from=build /build/service/authorisation-service/artifact /srv/service/authorisation-service/artifact
COPY --from=build /build/service/authorisation-service/package.json /srv/service/authorisation-service/package.json
COPY --from=build /build/service/authorisation-service/tsconfig.json /srv/service/authorisation-service/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/authorisation-service --production
CMD [ "node", "service/authorisation-service/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS error-service
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=library-configs /srv/library/configs /srv/library/configs
COPY --from=library-cors /srv/library/cors /srv/library/cors
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-secrets /srv/library/secrets /srv/library/secrets
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-types /srv/library/types /srv/library/types
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
COPY --from=library-utility /srv/library/utility /srv/library/utility
COPY --from=build /build/service/error-service/artifact /srv/service/error-service/artifact
COPY --from=build /build/service/error-service/package.json /srv/service/error-service/package.json
COPY --from=build /build/service/error-service/tsconfig.json /srv/service/error-service/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/error-service --production
CMD [ "node", "service/error-service/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS marketing-service
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=library-authentication /srv/library/authentication /srv/library/authentication
COPY --from=library-configs /srv/library/configs /srv/library/configs
COPY --from=library-cors /srv/library/cors /srv/library/cors
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-secrets /srv/library/secrets /srv/library/secrets
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-types /srv/library/types /srv/library/types
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
COPY --from=library-utility /srv/library/utility /srv/library/utility
COPY --from=build /build/service/marketing-service/artifact /srv/service/marketing-service/artifact
COPY --from=build /build/service/marketing-service/package.json /srv/service/marketing-service/package.json
COPY --from=build /build/service/marketing-service/tsconfig.json /srv/service/marketing-service/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/marketing-service --production
CMD [ "node", "service/marketing-service/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS navigation-service
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database-account-service /srv/database/account-service /srv/database/account-service
COPY --from=database-assignment-service /srv/database/assignment-service /srv/database/assignment-service
COPY --from=library-authentication /srv/library/authentication /srv/library/authentication
COPY --from=library-configs /srv/library/configs /srv/library/configs
COPY --from=library-cors /srv/library/cors /srv/library/cors
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-secrets /srv/library/secrets /srv/library/secrets
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-types /srv/library/types /srv/library/types
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
COPY --from=library-utility /srv/library/utility /srv/library/utility
COPY --from=build /build/service/navigation-service/artifact /srv/service/navigation-service/artifact
COPY --from=build /build/service/navigation-service/package.json /srv/service/navigation-service/package.json
COPY --from=build /build/service/navigation-service/tsconfig.json /srv/service/navigation-service/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/navigation-service --production
CMD [ "node", "service/navigation-service/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS portal-service
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database-assignment-service /srv/database/assignment-service /srv/database/assignment-service
COPY --from=library-authentication /srv/library/authentication /srv/library/authentication
COPY --from=library-configs /srv/library/configs /srv/library/configs
COPY --from=library-cors /srv/library/cors /srv/library/cors
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-secrets /srv/library/secrets /srv/library/secrets
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-types /srv/library/types /srv/library/types
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
COPY --from=library-utility /srv/library/utility /srv/library/utility
COPY --from=build /build/service/portal-service/artifact /srv/service/portal-service/artifact
COPY --from=build /build/service/portal-service/package.json /srv/service/portal-service/package.json
COPY --from=build /build/service/portal-service/tsconfig.json /srv/service/portal-service/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/portal-service --production
CMD [ "node", "service/portal-service/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS user-service
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database-assignment-service /srv/database/assignment-service /srv/database/assignment-service
COPY --from=database-user-service /srv/database/user-service /srv/database/user-service
COPY --from=library-authentication /srv/library/authentication /srv/library/authentication
COPY --from=library-configs /srv/library/configs /srv/library/configs
COPY --from=library-cors /srv/library/cors /srv/library/cors
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-encryption /srv/library/encryption /srv/library/encryption
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-secrets /srv/library/secrets /srv/library/secrets
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-types /srv/library/types /srv/library/types
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
COPY --from=library-utility /srv/library/utility /srv/library/utility
COPY --from=build /build/database/user-service /srv/database/user-service
COPY --from=build /build/service/user-service/artifact /srv/service/user-service/artifact
COPY --from=build /build/service/user-service/package.json /srv/service/user-service/package.json
COPY --from=build /build/service/user-service/tsconfig.json /srv/service/user-service/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/user-service --production
CMD [ "node", "service/user-service/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS user-service-queue
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database-assignment-service /srv/database/assignment-service /srv/database/assignment-service
COPY --from=database-user-service /srv/database/user-service /srv/database/user-service
COPY --from=library-configs /srv/library/configs /srv/library/configs
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-secrets /srv/library/secrets /srv/library/secrets
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-types /srv/library/types /srv/library/types
COPY --from=library-utility /srv/library/utility /srv/library/utility
COPY --from=build /build/worker/user-service-queue/artifact /srv/worker/user-service-queue/artifact
COPY --from=build /build/worker/user-service-queue/package.json /srv/worker/user-service-queue/package.json
COPY --from=build /build/worker/user-service-queue/tsconfig.json /srv/worker/user-service-queue/tsconfig.json
RUN yarn workspaces focus @tw050x.net.worker/user-service-queue --production
CMD [ "node", "worker/user-service-queue/artifact/run.js" ]
