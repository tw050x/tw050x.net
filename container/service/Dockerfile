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
  --from @tw050x.net/administration \
  --from @tw050x.net/authentication \
  --from @tw050x.net/marketing \
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

FROM node:23.11.1-alpine3.22 AS database
WORKDIR /srv
COPY --from=build /build/library/database/artifact /srv/library/database/artifact
COPY --from=build /build/library/database/package.json /srv/library/database/package.json
COPY --from=build /build/library/database/tsconfig.json /srv/library/database/tsconfig.json

FROM node:23.11.1-alpine3.22 AS logger
WORKDIR /srv
COPY --from=build /build/library/logger/artifact /srv/library/logger/artifact
COPY --from=build /build/library/logger/package.json /srv/library/logger/package.json
COPY --from=build /build/library/logger/tsconfig.json /srv/library/logger/tsconfig.json

FROM node:23.11.1-alpine3.22 AS middleware
WORKDIR /srv
COPY --from=build /build/library/middleware/artifact /srv/library/middleware/artifact
COPY --from=build /build/library/middleware/package.json /srv/library/middleware/package.json
COPY --from=build /build/library/middleware/tsconfig.json /srv/library/middleware/tsconfig.json

FROM node:23.11.1-alpine3.22 AS service
WORKDIR /srv
COPY --from=build /build/library/service/artifact /srv/library/service/artifact
COPY --from=build /build/library/service/package.json /srv/library/service/package.json
COPY --from=build /build/library/service/tsconfig.json /srv/library/service/tsconfig.json

FROM node:23.11.1-alpine3.22 AS uikit
WORKDIR /srv
COPY --from=build /build/library/uikit/artifact /srv/library/uikit/artifact
COPY --from=build /build/library/uikit/package.json /srv/library/uikit/package.json
COPY --from=build /build/library/uikit/tsconfig.json /srv/library/uikit/tsconfig.json

FROM node:23.11.1-alpine3.22 AS utility
WORKDIR /srv
COPY --from=build /build/library/utility/artifact /srv/library/utility/artifact
COPY --from=build /build/library/utility/package.json /srv/library/utility/package.json
COPY --from=build /build/library/utility/tsconfig.json /srv/library/utility/tsconfig.json

FROM node:23.11.1-alpine3.22 AS administration
RUN apk add --no-cache curl
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database /srv/library/database /srv/library/database
COPY --from=logger /srv/library/logger /srv/library/logger
COPY --from=middleware /srv/library/middleware /srv/library/middleware
COPY --from=service /srv/library/service /srv/library/service
COPY --from=uikit /srv/library/uikit /srv/library/uikit
COPY --from=utility /srv/library/utility /srv/library/utility
COPY --from=build /build/service/administration/artifact /srv/service/administration/artifact
COPY --from=build /build/service/administration/package.json /srv/service/administration/package.json
COPY --from=build /build/service/administration/tsconfig.json /srv/service/administration/tsconfig.json
RUN yarn workspaces focus @tw050x.net/administration
CMD [ "node", "service/administration/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS authentication
RUN apk add --no-cache curl
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database /srv/library/database /srv/library/database
COPY --from=logger /srv/library/logger /srv/library/logger
COPY --from=middleware /srv/library/middleware /srv/library/middleware
COPY --from=service /srv/library/service /srv/library/service
COPY --from=uikit /srv/library/uikit /srv/library/uikit
COPY --from=utility /srv/library/utility /srv/library/utility
COPY --from=build /build/service/authentication/artifact /srv/service/authentication/artifact
COPY --from=build /build/service/authentication/package.json /srv/service/authentication/package.json
COPY --from=build /build/service/authentication/tsconfig.json /srv/service/authentication/tsconfig.json
RUN yarn workspaces focus @tw050x.net/authentication
CMD [ "node", "service/authentication/artifact/serve.js" ]

FROM node:23.11.1-alpine3.22 AS marketing
RUN apk add --no-cache curl
WORKDIR /srv
COPY --from=dependencies /srv /srv
COPY --from=database /srv/library/database /srv/library/database
COPY --from=logger /srv/library/logger /srv/library/logger
COPY --from=middleware /srv/library/middleware /srv/library/middleware
COPY --from=service /srv/library/service /srv/library/service
COPY --from=uikit /srv/library/uikit /srv/library/uikit
COPY --from=utility /srv/library/utility /srv/library/utility
COPY --from=build /build/service/marketing/artifact /srv/service/marketing/artifact
COPY --from=build /build/service/marketing/package.json /srv/service/marketing/package.json
COPY --from=build /build/service/marketing/tsconfig.json /srv/service/marketing/tsconfig.json
RUN yarn workspaces focus @tw050x.net/marketing
CMD [ "node", "service/marketing/artifact/serve.js" ]
