# Build Image
FROM node:23 AS build
WORKDIR /build
COPY . /build

# Set arguments
ARG NODE_ENV=production

## Set the environment variables
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_ENV=build

## Install all dependencies
RUN yarn install --immutable

## Build the project
RUN yarn workspaces foreach --all run js:compile

# Dendencies Image
FROM node:23 AS dependencies
WORKDIR /dependencies
COPY . /dependencies

# Set arguments
ARG NODE_ENV=production

## Set the environment variables
ENV CYPRESS_INSTALL_BINARY=0
ENV NODE_ENV=production

## Install production dependencies
RUN yarn install --immutable

FROM node:23.11.1-alpine3.22 AS library-database
WORKDIR /srv
COPY --from=build /build/artifact/library/database /srv/library/database
COPY --from=dependencies /dependencies/library/database/node_modules /srv/library/database/node_modules

FROM node:23.11.1-alpine3.22 AS library-logger
WORKDIR /srv
COPY --from=build /build/artifact/library/logger /srv/library/logger
COPY --from=dependencies /dependencies/library/logger/node_modules /srv/library/logger/node_modules

FROM node:23.11.1-alpine3.22 AS library-middleware
WORKDIR /srv
COPY --from=build /build/artifact/library/middleware /srv/library/middleware
COPY --from=dependencies /dependencies/library/middleware/node_modules /srv/library/middleware/node_modules

FROM node:23.11.1-alpine3.22 AS library-service
WORKDIR /srv
COPY --from=build /build/artifact/library/service /srv/library/service
COPY --from=dependencies /dependencies/library/service/node_modules /srv/library/service/node_modules

FROM node:23.11.1-alpine3.22 AS library-type-guard
WORKDIR /srv
COPY --from=build /build/artifact/library/type-guard /srv/library/type-guard
COPY --from=dependencies /dependencies/library/type-guard/node_modules /srv/library/type-guard/node_modules

FROM node:23.11.1-alpine3.22 AS library-uikit
WORKDIR /srv
COPY --from=build /build/artifact/library/uikit /srv/library/uikit
COPY --from=build /build/library/uikit/component /srv/library/uikit/component
COPY --from=build /build/library/uikit/document /srv/library/uikit/document
COPY --from=build /build/library/uikit/layout /srv/library/uikit/layout
COPY --from=build /build/library/uikit/partial /srv/library/uikit/partial
COPY --from=build /build/library/uikit/svg /srv/library/uikit/svg
COPY --from=dependencies /dependencies/library/uikit/node_modules /srv/library/uikit/node_modules

# Final Image
FROM node:23.11.1-alpine3.22 AS service-administration
RUN apk add --no-cache curl
RUN npm install -g tsx --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=build /build/artifact/service/administration /srv/service/administration
COPY --from=build /build/service/administration/template /srv/service/administration/template
COPY --from=dependencies /dependencies/service/administration/node_modules /srv/service/administration/node_modules
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-type-guard /srv/library/type-guard /srv/library/type-guard
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
CMD [ "node", "service/administration/serve.js" ]

FROM node:23.11.1-alpine3.22 AS service-assets
RUN apk add --no-cache curl
RUN npm install -g tsx --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=build /build/service/assets/serve.json /srv/serve.json
COPY --from=build /build/service/assets/public /srv/service/assets/public
COPY --from=dependencies /dependencies/service/assets/node_modules /srv/service/assets/node_modules
ENTRYPOINT [ "sh", "-c" ]
CMD [ "/srv/service/assets/node_modules/.bin/serve --config /srv/serve.json --listen tcp://0.0.0.0:3000" ]

FROM node:23.11.1-alpine3.22 AS service-authentication
RUN apk add --no-cache curl
RUN npm install -g tsx --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=build /build/artifact/service/authentication /srv/service/authentication
COPY --from=build /build/service/authentication/template /srv/service/authentication/template
COPY --from=dependencies /dependencies/service/authentication/node_modules /srv/service/authentication/node_modules
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-type-guard /srv/library/type-guard /srv/library/type-guard
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
CMD [ "node", "service/authentication/serve.js" ]

FROM node:23.11.1-alpine3.22 AS service-marketing
RUN apk add --no-cache curl
RUN npm install -g tsx --production --no-optional && npm cache clean --force
WORKDIR /srv
COPY --from=build /build/artifact/service/marketing /srv/service/marketing
COPY --from=dependencies /dependencies/service/marketing/node_modules /srv/service/marketing/node_modules
COPY --from=library-database /srv/library/database /srv/library/database
COPY --from=library-logger /srv/library/logger /srv/library/logger
COPY --from=library-middleware /srv/library/middleware /srv/library/middleware
COPY --from=library-service /srv/library/service /srv/library/service
COPY --from=library-type-guard /srv/library/type-guard /srv/library/type-guard
COPY --from=library-uikit /srv/library/uikit /srv/library/uikit
CMD [ "node", "service/marketing/serve.js" ]
