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
  --from @tw050x.net.service/authentication \
  --from @tw050x.net.service/error \
  --from @tw050x.net.service/marketing \
  --from @tw050x.net.service/navigation \
  --from @tw050x.net.service/portal \
  --from @tw050x.net.service/user \
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

FROM node:23.11.1-alpine3.22 AS database-account
WORKDIR /srv
COPY --from=build /build/database/account/artifact /srv/database/account/artifact
COPY --from=build /build/database/account/package.json /srv/database/account/package.json
COPY --from=build /build/database/account/tsconfig.json /srv/database/account/tsconfig.json

FROM node:23.11.1-alpine3.22 AS database-assignment
WORKDIR /srv
COPY --from=build /build/database/assignment/artifact /srv/database/assignment/artifact
COPY --from=build /build/database/assignment/package.json /srv/database/assignment/package.json
COPY --from=build /build/database/assignment/tsconfig.json /srv/database/assignment/tsconfig.json

FROM node:23.11.1-alpine3.22 AS database-authentication
WORKDIR /srv
COPY --from=build /build/database/authentication/artifact /srv/database/authentication/artifact
COPY --from=build /build/database/authentication/package.json /srv/database/authentication/package.json
COPY --from=build /build/database/authentication/tsconfig.json /srv/database/authentication/tsconfig.json

FROM node:23.11.1-alpine3.22 AS database-user
WORKDIR /srv
COPY --from=build /build/database/user/artifact /srv/database/user/artifact
COPY --from=build /build/database/user/package.json /srv/database/user/package.json
COPY --from=build /build/database/user/tsconfig.json /srv/database/user/tsconfig.json

FROM node:23.11.1-alpine3.22 AS library-configuration
WORKDIR /srv
COPY --from=build /build/library/configuration/artifact /srv/library/configuration/artifact
COPY --from=build /build/library/configuration/package.json /srv/library/configuration/package.json
COPY --from=build /build/library/configuration/tsconfig.json /srv/library/configuration/tsconfig.json

FROM node:23.11.1-alpine3.22 AS library-database
WORKDIR /srv
COPY --from=build /build/library/database/artifact /srv/library/database/artifact
COPY --from=build /build/library/database/package.json /srv/library/database/package.json
COPY --from=build /build/library/database/tsconfig.json /srv/library/database/tsconfig.json

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

FROM node:23.11.1-alpine3.22 AS library-queue
WORKDIR /srv
COPY --from=build /build/library/queue/artifact /srv/library/queue/artifact
COPY --from=build /build/library/queue/package.json /srv/library/queue/package.json
COPY --from=build /build/library/queue/tsconfig.json /srv/library/queue/tsconfig.json

FROM node:23.11.1-alpine3.22 AS library-secret
WORKDIR /srv
COPY --from=build /build/library/secret/artifact /srv/library/secret/artifact
COPY --from=build /build/library/secret/package.json /srv/library/secret/package.json
COPY --from=build /build/library/secret/tsconfig.json /srv/library/secret/tsconfig.json

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

FROM node:23.11.1-alpine3.22 AS service-assets
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=build /build/service/assets/public /srv/service/assets/public
COPY --from=build /build/service/assets/package.json /srv/service/assets/package.json
COPY --from=build /build/service/assets/tsconfig.json /srv/service/assets/tsconfig.json
COPY --from=build /build/service/assets/serve.json /srv/service/assets/serve.json
RUN yarn workspaces focus --production @tw050x.net.service/assets --production
ENTRYPOINT [ "sh", "-c" ]
CMD [ "yarn workspace @tw050x.net.service/assets serve --config /srv/service/assets/serve.json --listen tcp://0.0.0.0:3000" ]

FROM node:23.11.1-alpine3.22 AS service-authentication
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database-account /srv/database/account /srv/database/account
COPY --from=database-user /srv/database/user /srv/database/user
COPY --from=library-configuration /srv/library/configuration /srv/library/configuration
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-queue /srv/library/queue /srv/library/queue
COPY --from=library-secret /srv/library/secret /srv/library/secret
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-types /srv/library/types /srv/library/types
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
COPY --from=library-utility /srv/library/utility /srv/library/utility
COPY --from=build /build/database/authentication /srv/database/authentication
COPY --from=build /build/database/user /srv/database/user
COPY --from=build /build/service/authentication/artifact /srv/service/authentication/artifact
COPY --from=build /build/service/authentication/package.json /srv/service/authentication/package.json
COPY --from=build /build/service/authentication/tsconfig.json /srv/service/authentication/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/authentication --production
CMD [ "node", "service/authentication/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS service-error
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=library-configuration /srv/library/configuration /srv/library/configuration
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-queue /srv/library/queue /srv/library/queue
COPY --from=library-secret /srv/library/secret /srv/library/secret
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-types /srv/library/types /srv/library/types
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
COPY --from=library-utility /srv/library/utility /srv/library/utility
COPY --from=build /build/service/error/artifact /srv/service/error/artifact
COPY --from=build /build/service/error/package.json /srv/service/error/package.json
COPY --from=build /build/service/error/tsconfig.json /srv/service/error/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/error --production
CMD [ "node", "service/error/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS service-marketing
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=library-configuration /srv/library/configuration /srv/library/configuration
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-queue /srv/library/queue /srv/library/queue
COPY --from=library-secret /srv/library/secret /srv/library/secret
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-types /srv/library/types /srv/library/types
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
COPY --from=library-utility /srv/library/utility /srv/library/utility
COPY --from=build /build/service/marketing/artifact /srv/service/marketing/artifact
COPY --from=build /build/service/marketing/package.json /srv/service/marketing/package.json
COPY --from=build /build/service/marketing/tsconfig.json /srv/service/marketing/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/marketing --production
CMD [ "node", "service/marketing/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS service-navigation
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database-assignment /srv/database/assignment /srv/database/assignment
COPY --from=library-configuration /srv/library/configuration /srv/library/configuration
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-queue /srv/library/queue /srv/library/queue
COPY --from=library-secret /srv/library/secret /srv/library/secret
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-types /srv/library/types /srv/library/types
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
COPY --from=library-utility /srv/library/utility /srv/library/utility
COPY --from=build /build/service/navigation/artifact /srv/service/navigation/artifact
COPY --from=build /build/service/navigation/package.json /srv/service/navigation/package.json
COPY --from=build /build/service/navigation/tsconfig.json /srv/service/navigation/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/navigation --production
CMD [ "node", "service/navigation/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS service-portal
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database-assignment /srv/database/assignment /srv/database/assignment
COPY --from=library-configuration /srv/library/configuration /srv/library/configuration
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-queue /srv/library/queue /srv/library/queue
COPY --from=library-secret /srv/library/secret /srv/library/secret
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-types /srv/library/types /srv/library/types
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
COPY --from=library-utility /srv/library/utility /srv/library/utility
COPY --from=build /build/service/portal/artifact /srv/service/portal/artifact
COPY --from=build /build/service/portal/package.json /srv/service/portal/package.json
COPY --from=build /build/service/portal/tsconfig.json /srv/service/portal/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/portal --production
CMD [ "node", "service/portal/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS service-user
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database-assignment /srv/database/assignment /srv/database/assignment
COPY --from=database-authentication /srv/database/authentication /srv/database/authentication
COPY --from=database-user /srv/database/user /srv/database/user
COPY --from=library-configuration /srv/library/configuration /srv/library/configuration
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-queue /srv/library/queue /srv/library/queue
COPY --from=library-secret /srv/library/secret /srv/library/secret
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-types /srv/library/types /srv/library/types
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
COPY --from=library-utility /srv/library/utility /srv/library/utility
COPY --from=build /build/database/authentication /srv/database/authentication
COPY --from=build /build/database/user /srv/database/user
COPY --from=build /build/service/user/artifact /srv/service/user/artifact
COPY --from=build /build/service/user/package.json /srv/service/user/package.json
COPY --from=build /build/service/user/tsconfig.json /srv/service/user/tsconfig.json
RUN yarn workspaces focus @tw050x.net.service/user --production
CMD [ "node", "service/user/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS worker-user-service-queue
RUN apk add --no-cache curl
RUN npm install -g nodemon --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database-assignment /srv/database/assignment /srv/database/assignment
COPY --from=database-user /srv/database/user /srv/database/user
COPY --from=library-configuration /srv/library/configuration /srv/library/configuration
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-queue /srv/library/queue /srv/library/queue
COPY --from=library-secret /srv/library/secret /srv/library/secret
COPY --from=library-types /srv/library/types /srv/library/types
COPY --from=build /build/worker/user-service-queue/artifact /srv/worker/user-service-queue/artifact
COPY --from=build /build/worker/user-service-queue/package.json /srv/worker/user-service-queue/package.json
COPY --from=build /build/worker/user-service-queue/tsconfig.json /srv/worker/user-service-queue/tsconfig.json
RUN yarn workspaces focus @tw050x.net.worker/user-service-queue --production
CMD [ "node", "worker/user-service-queue/artifact/run.js" ]
